/**
 * Generate TTS audio for all articles missing audio files using OpenAI TTS HD.
 * Reads scripts from decisions.json, generates MP3 via OpenAI API, saves to audio/ folder.
 */
const fs = require('fs-extra');
const path = require('path');
const https = require('https');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
    console.error('❌ OPENAI_API_KEY not set. Run: $env:OPENAI_API_KEY = "sk-..."');
    process.exit(1);
}

const AUDIO_DIR = path.join(__dirname, 'audio');
const MODEL = 'tts-1-hd';
const VOICE = 'alloy';

async function generateTTS(text, outputPath) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: MODEL,
            input: text,
            voice: VOICE,
            response_format: 'mp3'
        });

        const req = https.request({
            hostname: 'api.openai.com',
            path: '/v1/audio/speech',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => reject(new Error(`API ${res.statusCode}: ${data}`)));
                return;
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                fs.writeFileSync(outputPath, buffer);
                resolve(buffer.length);
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    await fs.ensureDir(AUDIO_DIR);

    const decisions = JSON.parse(await fs.readFile('data/decisions.json', 'utf8'));

    // Find articles needing audio (no MP3 file on disk)
    const needsAudio = decisions.filter(d => {
        if (!d.audio || !d.audio.script) return false;
        const mp3Path = path.join(AUDIO_DIR, `${d.slug}.mp3`);
        return !fs.existsSync(mp3Path);
    });

    if (needsAudio.length === 0) {
        console.log('✅ All articles already have audio.');
        return;
    }

    console.log(`🎙️  Generating ${needsAudio.length} audio files with OpenAI ${MODEL}...\n`);

    let totalChars = 0;
    let totalBytes = 0;

    for (const d of needsAudio) {
        const filename = `${d.slug}.mp3`;
        const outputPath = path.join(AUDIO_DIR, filename);
        const chars = d.audio.script.length;
        totalChars += chars;

        process.stdout.write(`  🔊 ${d.slug} (${chars} chars)... `);

        try {
            const bytes = await generateTTS(d.audio.script, outputPath);
            totalBytes += bytes;

            // Estimate duration (MP3 128kbps ≈ 16KB/sec)
            const estimatedDuration = Math.round(bytes / 16000);
            d.audio.durationSec = estimatedDuration;
            d.audio.provider = 'openai';
            d.audio.voice = VOICE;

            console.log(`✅ ${(bytes / 1024).toFixed(0)}KB (~${estimatedDuration}s)`);

            // Small delay to avoid rate limits
            await new Promise(r => setTimeout(r, 500));
        } catch (err) {
            console.log(`❌ ${err.message}`);
        }
    }

    // Save updated durations back to decisions.json
    await fs.writeFile('data/decisions.json', JSON.stringify(decisions, null, 4));

    const cost = (totalChars / 1000 * 0.030).toFixed(3);
    console.log(`\n✅ Done! ${needsAudio.length} files, ${(totalBytes / 1024 / 1024).toFixed(1)}MB total`);
    console.log(`💰 Estimated cost: $${cost} (${totalChars} chars × $0.030/1K)`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
