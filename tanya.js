// Penghubung AI generatif untuk Pak Bram (Netlify Function).
// API key disimpan di pengaturan Netlify (Environment variables), TIDAK di dalam index.html.
//   GEMINI_API_KEY : API key dari Google AI Studio (https://aistudio.google.com)
//   GEMINI_MODEL   : opsional, daftar model dipisah koma. Default "gemini-2.5-flash,gemini-2.5-flash-lite"

const ETNOSAINS = `Contoh budaya Sasambo (NTB) yang bisa dipakai sebagai analogi:
- Sasak (Lombok): gerabah Banyumulek (perubahan sifat benda, kalor), Bau Nyale (daur hidup cacing laut, ekosistem karang), garam tradisional pesisir (penguapan, campuran), lumbung Sasak (sifat bahan, sirkulasi udara), gula aren dari nira (perubahan wujud, kalor, perubahan zat).
- Samawa (Sumbawa): Barapan Kebo (gaya, gerak, gesekan di lumpur), madu hutan Sumbawa (lebah, penyerbukan, rantai makanan), susu kuda liar (mamalia, pengawetan alami).
- Mbojo (Bima): Uma Lengge (rumah panggung, bahan alam, iklim), tenun Tembe Nggoli (serat, pewarna alami), Rimpu Mpida (melindungi diri dari debu dan asap, pencemaran udara).`;

function systemPrompt(kelas, nama){
  return `Kamu adalah Pak Bram, guru IPA yang ramah untuk siswa SD di Nusa Tenggara Barat. Kamu sedang menjawab siswa ${kelas || 'SD'}${nama ? ' bernama ' + nama : ''}.
Aturan:
- Jawab dalam bahasa Indonesia yang hangat, sederhana, dan sesuai usia ${kelas || 'SD'}. Maksimal 4 kalimat pendek.
- Jawaban akan dibacakan dengan suara, jadi jangan pakai markdown, daftar berpoin, simbol, atau emoji.
- Jika relevan, kaitkan konsep IPA dengan budaya Sasambo di bawah ini atau kehidupan sehari-hari di NTB. Jangan memaksakan jika tidak cocok.
- Pastikan fakta sains benar. Jika tidak yakin, katakan dengan jujur dan sarankan bertanya ke guru.
- Hanya bahas topik belajar. Tolak dengan sopan permintaan yang tidak pantas untuk anak, dan jangan meminta data pribadi.
${ETNOSAINS}`;
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Gunakan POST' }) };
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { statusCode: 500, headers, body: JSON.stringify({ error: 'GEMINI_API_KEY belum diisi di Netlify' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Format tidak valid' }) }; }
  const question = String(body.question || '').slice(0, 500).trim();
  if (!question) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Pertanyaan kosong' }) };

  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
  const contents = history
    .filter(m => m && typeof m.content === 'string')
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content.slice(0, 800) }] }));
  contents.push({ role: 'user', parts: [{ text: question }] });

  // Dicoba berurutan: jika kuota harian satu model habis (free tier), pindah ke model berikutnya.
  const models = (process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.5-flash-lite').split(',').map(m => m.trim()).filter(Boolean);
  try {
    let res, data;
    for (const model of models) {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt(String(body.kelas || ''), String(body.nama || '').slice(0, 30)) }] },
          contents,
          generationConfig: { temperature: 0.5, maxOutputTokens: 400 },
        }),
      });
      data = await res.json();
      if (res.ok) break;
      if (![404, 429, 503].includes(res.status)) break;
    }
    if (!res.ok) return { statusCode: res.status === 429 ? 429 : 502, headers, body: JSON.stringify({ error: (data.error && data.error.message) || 'AI gagal menjawab' }) };
    const answer = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts || [])
      .map(p => p.text || '').join(' ').replace(/[*#_`]/g, '').trim();
    if (!answer) return { statusCode: 502, headers, body: JSON.stringify({ error: 'Jawaban kosong' }) };
    return { statusCode: 200, headers, body: JSON.stringify({ answer }) };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Tidak bisa menghubungi AI' }) };
  }
};
