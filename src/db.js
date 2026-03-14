/**
 * Dosya Tabanlı Log Depolama Modülü
 * Logları uygulama klasöründe saved_logs/ altında JSON olarak saklar.
 * Dosya adı: {seri_numarası}_{orijinal_dosya_adı}.json
 */

const path = require('path');
const fs = require('fs');

let storagePath = '';

// ── Depolama Klasörünü Başlat ────────────────────
function init(appPath) {
  storagePath = path.join(appPath, 'saved_logs');
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
  // Teknik notlar için ayrı klasör
  const notesPath = path.join(appPath, 'saved_notes');
  if (!fs.existsSync(notesPath)) {
    fs.mkdirSync(notesPath, { recursive: true });
  }
}

function getStoragePath() { return storagePath; }
function getNotesPath() { return path.join(path.dirname(storagePath), 'saved_notes'); }

// ── Dosya adını güvenli hale getir ───────────────
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
}

// ── Log Dosyası Kaydet ───────────────────────────
function saveLogFile(serial, filename, kwLimit, rawContent, evLog, dtLog, analysis) {
  const safeName = sanitizeFilename(filename.replace(/\.(txt|log)$/i, ''));
  const jsonFilename = `${serial}_${safeName}.json`;
  const txtFilename = `${serial}_${safeName}.txt`;
  const jsonPath = path.join(storagePath, jsonFilename);
  const txtPath = path.join(storagePath, txtFilename);

  const data = {
    serial,
    filename,
    kwLimit,
    rawContent,
    status: analysis.faults && analysis.faults.length > 0 ? 'fault'
          : analysis.warns && analysis.warns.length > 0 ? 'warn' : 'normal',
    dateRange: analysis.dr || '—',
    totalEvents: evLog.length,
    totalDataRows: dtLog.length,
    faultCount: analysis.faults ? analysis.faults.length : 0,
    warnCount: analysis.warns ? analysis.warns.length : 0,
    deepDischargeCount: analysis.zero || 0,
    savedAt: new Date().toISOString()
  };

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  if (rawContent && rawContent.length > 0) {
    fs.writeFileSync(txtPath, rawContent, 'utf-8');
  }
  return { success: true, filePath: jsonFilename };
}

// ── PDF Raporu Kaydet ────────────────────────────
function saveGeneratedPDF(serial, filename, base64Data) {
  const safeName = sanitizeFilename(filename.replace(/\.pdf$/i, ''));
  const pdfFilename = `${safeName}.pdf`;
  const filePath = path.join(storagePath, pdfFilename);

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return { success: true, filePath: pdfFilename };
  } catch (e) {
    console.error('PDF save error:', e);
    return { success: false, error: e.message };
  }
}

// ── Kaydedilmiş Logları Listele ──────────────────
function listLogFiles() {
  if (!fs.existsSync(storagePath)) return [];

  const files = fs.readdirSync(storagePath)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const filePath = path.join(storagePath, f);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const stat = fs.statSync(filePath);
        return {
          id: f, // dosya adını ID olarak kullan
          serial_number: data.serial,
          filename: data.filename,
          kw_limit: data.kwLimit,
          date_range: data.dateRange,
          total_events: data.totalEvents,
          total_data_rows: data.totalDataRows,
          fault_count: data.faultCount,
          warn_count: data.warnCount,
          deep_discharge_count: data.deepDischargeCount,
          status: data.status,
          uploaded_at: data.savedAt || stat.mtime.toISOString(),
          customer_name: getCustomerName(data.serial)
        };
      } catch (e) {
        console.warn('Dosya okunamadı:', f, e.message);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

  return files;
}

// ── Belirli Log Dosyasını Yükle ──────────────────
function loadLogFile(fileId) {
  const filePath = path.join(storagePath, fileId);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return {
      rawContent: data.rawContent,
      filename: data.filename,
      serial: data.serial,
      kwLimit: data.kwLimit,
      status: data.status,
      uploadedAt: data.savedAt
    };
  } catch (e) {
    console.error('Log yükleme hatası:', e);
    return null;
  }
}

// ── Log Dosyası Sil ──────────────────────────────
function deleteLogFile(fileId) {
  const filePath = path.join(storagePath, fileId);
  const safeBase = fileId.replace(/\.json$/i, '');
  const txtPath = path.join(storagePath, safeBase + '.txt');

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  if (fs.existsSync(txtPath)) {
    fs.unlinkSync(txtPath);
  }

  // Related PDF will not be deleted aggressively as customer might want to keep the report,
  // but txt and json are deleted together if they exist.
  return { success: true };
}

// ── Teknik Servis Notu Kaydet ────────────────────
function saveNote(serial, noteText) {
  const notesPath = getNotesPath();
  const filePath = path.join(notesPath, `${sanitizeFilename(serial)}.txt`);
  fs.writeFileSync(filePath, noteText, 'utf-8');
  return { success: true };
}

// ── Teknik Servis Notu Getir ─────────────────────
function getNote(serial) {
  const notesPath = getNotesPath();
  const filePath = path.join(notesPath, `${sanitizeFilename(serial)}.txt`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return '';
}

// ── Müşteri Adı Kaydet ──────────────────────────
function saveCustomerName(serial, nameText) {
  const notesPath = getNotesPath();
  const filePath = path.join(notesPath, `${sanitizeFilename(serial)}_customer.txt`);
  fs.writeFileSync(filePath, nameText, 'utf-8');
  return { success: true };
}

// ── Müşteri Adı Getir ───────────────────────────
function getCustomerName(serial) {
  const notesPath = getNotesPath();
  const filePath = path.join(notesPath, `${sanitizeFilename(serial)}_customer.txt`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return '';
}

// ── Seri Numarası Değiştir ────────────────────────
function renameSerial(oldSerial, newSerial) {
  const oldSafe = sanitizeFilename(oldSerial);
  const newSafe = sanitizeFilename(newSerial);

  if (oldSerial === newSerial) return { success: true };

  // 1. saved_logs altındaki tüm log dosyalarını bul ve güncelle (json, txt, pdf)
  const logFiles = fs.readdirSync(storagePath).filter(f => f.startsWith(oldSerial + '_'));
  
  for (const f of logFiles) {
    const oldPath = path.join(storagePath, f);
    const newFileName = f.replace(oldSerial, newSerial);
    const newPath = path.join(storagePath, newFileName);

    try {
      let finalNewPath = newPath;
      if (fs.existsSync(newPath)) {
        // Eğer hedef dosya zaten varsa (başka bir cihazdan gelmiş olabilir), veri kaybını önlemek için timestamp ekle
        const ext = path.extname(newPath);
        finalNewPath = newPath.replace(ext, '_' + Date.now() + ext);
      }

      // If it's the json file, we also need to update the data.serial inside
      if (f.endsWith('.json')) {
        const raw = fs.readFileSync(oldPath, 'utf-8');
        const data = JSON.parse(raw);
        data.serial = newSerial;
        fs.writeFileSync(oldPath, JSON.stringify(data, null, 2), 'utf-8');
      }
      fs.renameSync(oldPath, finalNewPath);
    } catch (e) {
      console.error(`Log dosya rename hatası (${f}):`, e);
    }
  }

  // 2. saved_notes altındaki not ve müşteri dosyalarını güncelle
  const notesPath = getNotesPath();
  const noteTypes = ['', '_customer'];
  noteTypes.forEach(suffix => {
    const oldNotePath = path.join(notesPath, `${oldSafe}${suffix}.txt`);
    const newNotePath = path.join(notesPath, `${newSafe}${suffix}.txt`);
    
    if (fs.existsSync(oldNotePath)) {
      try {
        // Eğer hedef not dosyası zaten varsa, siliyoruz çünkü kullanıcı bu serial'e geçmek istiyor.
        // Ama user'ın "müşteri ismi aynı" şikayeti üzerine: 
        // Eğer içerik aynıysa hata vermemeli. renameSync overwrite eder ama dosya kilitliyse fail olabilir.
        if (fs.existsSync(newNotePath)) {
          fs.unlinkSync(newNotePath);
        }
        fs.renameSync(oldNotePath, newNotePath);
      } catch (e) {
        console.error(`Not/Müşteri dosya rename hatası (${oldNotePath}):`, e);
      }
    }
  });

  return { success: true };
}

module.exports = {
  init,
  getStoragePath,
  saveLogFile,
  saveGeneratedPDF,
  listLogFiles,
  loadLogFile,
  deleteLogFile,
  saveNote,
  getNote,
  saveCustomerName,
  getCustomerName,
  renameSerial
};
