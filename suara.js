// Suara alami Pak Bram (Gemini Text-to-Speech) lewat Netlify Function.
// Pengaturan di Netlify (Environment variables):
//   GEMINI_API_KEY    : API key dari Google AI Studio (sama dengan penghubung AI)
//   GEMINI_TTS_MODEL  : opsional, daftar model dipisah koma. Default "gemini-2.5-flash-preview-tts,gemini-2.5-flash-tts"
//   GEMINI_TTS_VOICE  : opsional, suara pria bawaan jika siswa belum memilih, default "Charon"
// Siswa/guru dapat memilih suara, gaya bicara, dan kecepatan dari menu "Suara Pak Bram" di aplikasi.

const VOICES = ['Charon','Achird','Puck','Iapetus','Sadaltager','Orus','Algenib','Fenrir'];
const GAYA = {
  cerita: 'hangat dan bercerita, seperti guru SD yang sabar menjelaskan kepada murid',
  semangat: 'bersemangat dan ceria, seperti guru yang mengajak murid antusias belajar',
  tenang: 'tenang, lembut, dan pelan, seperti guru yang menenangkan murid',
  tegas: 'tegas, jelas, dan berwibawa, seperti guru yang memberi arahan di kelas',
};
const TEMPO = { pelan: 'Tempo pelan.', normal: 'Tempo santai dan wajar.', cepat: 'Tempo agak cepat namun tetap jelas.' };

function wavFromPcm(pcm, sampleRate = 24000, channels = 1, bits = 16){
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * bits / 8;
  header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22); header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(channels * bits / 8, 32); header.writeUInt16LE(bits, 34);
  header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

exports.handler = async (event) => {
  const json = { 'Content-Type': 'application/json' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: json, body: JSON.stringify({ error: 'Gunakan POST' }) };
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { statusCode: 500, headers: json, body: JSON.stringify({ error: 'GEMINI_API_KEY belum diisi di Netlify' }) };
  let text = '', req = {};
  try { req = JSON.parse(event.body || '{}'); text = String(req.text || '').slice(0, 1500).trim(); } catch (e) {}
  if (!text) return { statusCode: 400, headers: json, body: JSON.stringify({ error: 'Teks kosong' }) };

  const models = (process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts,gemini-2.5-flash-tts').split(',').map(m => m.trim()).filter(Boolean);
  const voice = VOICES.includes(req.voice) ? req.voice : (process.env.GEMINI_TTS_VOICE || 'Charon');
  const gaya = GAYA[req.gaya] || GAYA.cerita;
  const tempo = TEMPO[req.cepat] || TEMPO.normal;
  const prompt = `Bacakan dalam bahasa Indonesia dengan suara guru laki-laki yang ${gaya}. ${tempo} Ucapkan dengan alami seperti manusia, ada jeda wajar di setiap titik:\n\n${text}`;
  try {
    let res, data;
    for (const model of models) {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
        }),
      });
      data = await res.json();
      if (res.ok || res.status !== 404) break;   // 404 = nama model tidak dikenal, coba nama berikutnya
    }
    if (!res.ok) return { statusCode: res.status === 429 ? 429 : 502, headers: json, body: JSON.stringify({ error: (data.error && data.error.message) || 'TTS gagal' }) };
    const part = (((data.candidates || [])[0] || {}).content || {}).parts || [];
    const inline = (part.find(p => p.inlineData) || {}).inlineData;
    if (!inline || !inline.data) return { statusCode: 502, headers: json, body: JSON.stringify({ error: 'Audio kosong' }) };
    const rate = parseInt(((inline.mimeType || '').match(/rate=(\d+)/) || [])[1] || '24000', 10);
    const wav = wavFromPcm(Buffer.from(inline.data, 'base64'), rate);
    return { statusCode: 200, headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'public, max-age=31536000' }, body: wav.toString('base64'), isBase64Encoded: true };
  } catch (e) {
    return { statusCode: 502, headers: json, body: JSON.stringify({ error: 'Tidak bisa menghubungi layanan suara' }) };
  }
};
