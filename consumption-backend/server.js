const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File storage directory
const FILES_DIR = path.join(__dirname, 'generated_files');
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR);
}

// CMH configurations
const cmhConfigs = {
  cmh1: {
    BOT_TOKEN: "8264293111:AAF_WCJJLabD5S3alNmgNvQOuGu3zukzoRs",
    CHAT_ID: "8304177747",
    name: "CMH 1"
  },
  cmh2: {
    BOT_TOKEN: "8529644027:AAEVaCDf4EMOKgu0oalJkD94tEISKsa3NzY",
    CHAT_ID: "8304177747",
    name: "CMH 2"
  },
  cmh3: {
    BOT_TOKEN: "8229900745:AAH4j_U_10-pWaC-gyeQOa0WIFBrv36pRY8",
    CHAT_ID: "8304177747",
    name: "CMH 3"
  }
};

// Allowed titles for each CMH
const allowedTitles = ['IP', 'IP2', 'OFFER AUTO', 'OFFER BY REQUEST'];

// Helper function to get today's date string
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

// Generate HTML content
const generateHTMLContent = (data) => {
  const { title, seedsInput, activeInput, sessionsOutInput, cmh } = data;
  
  const parseInput = (input) => {
    return input.split('\n')
                .map(value => value.trim())
                .filter(value => value !== '');
  };

  const seedsValues = parseInput(seedsInput);
  const activeValues = parseInput(activeInput);
  
  let totalSeeds = 0;
  let totalActive = 0;
  let totalBlocked = 0;
  
  seedsValues.forEach((seeds, i) => {
    const seedsNum = parseInt(seeds) || 0;
    const activeNum = parseInt(activeValues[i]) || 0;
    const blockedNum = seedsNum - activeNum;
    
    totalSeeds += seedsNum;
    totalActive += activeNum;
    totalBlocked += blockedNum;
  });

  const activePercentage = totalSeeds > 0 ? Math.round((totalActive/totalSeeds)*100) : 0;
  const blockedPercentage = totalSeeds > 0 ? Math.round((totalBlocked/totalSeeds)*100) : 0;

  const cmhName = cmhConfigs[cmh]?.name || cmh;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cmhName} - ${title} - Consumption Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #f8f6f2; color: #2c3e50; line-height: 1.4; padding: 8px; font-size: 11px; height: 100vh; overflow: hidden; }
  .container { display: grid; grid-template-columns: 280px 1fr; gap: 10px; height: 100%; max-height: 100vh; }
  .header { grid-column: 1 / -1; text-align: center; margin-bottom: 8px; padding: 8px; border-bottom: 2px solid #800020; }
  .cmh-badge { background: #800020; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; margin-bottom: 4px; display: inline-block; }
  .title { font-size: 1.3rem; font-weight: 700; background: linear-gradient(135deg, #800020, #6B8E23); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 4px; }
  .subtitle { color: #7f8c8d; font-size: 0.7rem; }
  .left-panel { display: flex; flex-direction: column; gap: 10px; }
  .stats-panel { background: rgba(128, 0, 32, 0.05); border-radius: 8px; padding: 10px; border: 1px solid #e1e5e9; }
  .stat-item { margin-bottom: 6px; padding: 4px 0; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; }
  .stat-value { font-weight: 700; color: #800020; }
  .diagram-container { background: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 10px; border: 1px solid #e1e5e9; flex-grow: 1; display: flex; flex-direction: column; }
  .diagram-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: #2c3e50; text-align: center; }
  .chart-container { position: relative; width: 140px; height: 140px; margin: 0 auto; }
  .pie-chart { width: 100%; height: 100%; position: relative; border-radius: 50%; background: conic-gradient( #6B8E23 0% ${activePercentage}%, #800020 ${activePercentage}% 100% ); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05); }
  .chart-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: white; border-radius: 50%; box-shadow: 0 0 8px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; border: 1px solid #e1e5e9; }
  .total-count { font-size: 0.9rem; font-weight: 700; color: #B8860B; line-height: 1; }
  .total-label { font-size: 0.6rem; color: #7f8c8d; margin-top: 2px; }
  .diagram-legend { margin-top: 10px; }
  .legend-item { display: flex; align-items: center; margin-bottom: 6px; padding: 4px 6px; border-radius: 5px; background: rgba(255, 255, 255, 0.05); border: 1px solid #e1e5e9; }
  .legend-color { width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }
  .legend-label { flex: 1; font-size: 0.7rem; font-weight: 500; }
  .legend-percentage { font-weight: 700; color: #B8860B; margin-left: 3px; font-size: 0.7rem; }
  .legend-count { font-size: 0.65rem; color: #7f8c8d; margin-left: 3px; }
  .table-container { background: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 10px; border: 1px solid #e1e5e9; overflow: auto; height: 100%; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-radius: 6px; overflow: hidden; }
  th { background: linear-gradient(135deg, #800020, #5A0017); padding: 6px 4px; text-align: left; border-bottom: 2px solid #e1e5e9; font-weight: 600; color: white; font-size: 0.7rem; position: sticky; top: 0; }
  td { padding: 4px; border-bottom: 1px solid #e1e5e9; font-size: 0.65rem; }
  .totals-row { background: linear-gradient(135deg, rgba(128, 0, 32, 0.1), rgba(107, 142, 35, 0.1)); font-weight: 600; position: sticky; bottom: 0; }
  footer { grid-column: 1 / -1; text-align: center; margin-top: 8px; padding: 6px; color: #7f8c8d; border-top: 1px solid #e1e5e9; font-size: 0.65rem; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="cmh-badge">${cmhName}</div>
      <h1 class="title">${title}</h1>
      <p class="subtitle">Consumption Report - Generated on ${new Date().toLocaleDateString('en-GB')}</p>
    </div>
    
    <div class="left-panel">
      <div class="stats-panel">
        <div class="stat-item"><span>Total Consumption: </span><span class="stat-value">${totalSeeds}</span></div>
        <div class="stat-item"><span>Total Seeds Active: </span><span class="stat-value">${totalActive}</span></div>
        <div class="stat-item"><span>Total Seeds Blocked: </span><span class="stat-value">${totalBlocked}</span></div>
      </div>
      
      <div class="diagram-container">
        <h3 class="diagram-title">Consumption Overview</h3>
        <div class="chart-container">
          <div class="pie-chart">
            <div class="chart-center">
              <div class="total-count">${totalSeeds}</div>
              <div class="total-label">Total</div>
            </div>
          </div>
        </div>
        <div class="diagram-legend">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #6B8E23;"></div>
            <span class="legend-label">Active Seeds</span>
            <span class="legend-percentage">${activePercentage}%</span>
            <span class="legend-count">(${totalActive})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #800020;"></div>
            <span class="legend-label">Blocked Seeds</span>
            <span class="legend-percentage">${blockedPercentage}%</span>
            <span class="legend-count">(${totalBlocked})</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <h3>Detailed Data</h3>
      <table class="${seedsValues.length > 15 ? 'compact-table' : ''}">
        <thead>
          <tr>
            <th style="width: 15%">Drop N°</th>
            <th style="width: 25%">CONSOMMATION SEEDS</th>
            <th style="width: 20%">ACTIVE/DROP</th>
            <th style="width: 20%">BLOCKED</th>
            <th style="width: 20%">SESSIONS OUT</th>
          </tr>
        </thead>
        <tbody>
          ${seedsValues.map((seeds, i) => {
            const dropNumber = i + 1;
            const active = parseInt(activeValues[i]) || 0;
            const blocked = parseInt(seeds) - active;
            return `
              <tr>
                <td>${dropNumber}</td>
                <td>${seeds}</td>
                <td>${active}</td>
                <td>${blocked}</td>
                <td>${sessionsOutInput}</td>
              </tr>
            `;
          }).join('')}
          <tr class="totals-row">
            <td colspan="2">TOTAL: ${totalSeeds}</td>
            <td>ACTIVE: ${totalActive}</td>
            <td>BLOCKED: ${totalBlocked}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <footer><p>CMHW - ${cmhName}</p></footer>
  </div>
</body>
</html>
    `;
};

// Fix for Chrome DevTools CSP error
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({});
});

// API Routes

// Get all today's generated files
app.get('/api/files/today', (req, res) => {
  try {
    const today = getTodayDateString();
    const files = [];
    
    if (fs.existsSync(FILES_DIR)) {
      const fileNames = fs.readdirSync(FILES_DIR);
      fileNames.forEach(fileName => {
        if (fileName.startsWith(today)) {
          const filePath = path.join(FILES_DIR, fileName);
          const stats = fs.statSync(filePath);
          
          // Extract CMH and title from filename
          const parts = fileName.replace('.html', '').split('_');
          const cmh = parts[1]; // cmh1, cmh2, etc.
          const title = parts[2];
          
          files.push({
            fileName,
            title,
            cmh,
            cmhName: cmhConfigs[cmh]?.name || cmh,
            createdAt: stats.birthtime,
            filePath
          });
        }
      });
    }
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Generate and save HTML file
app.post('/api/generate-file', (req, res) => {
  try {
    const { title, seedsInput, activeInput, sessionsOutInput, cmh } = req.body;
    
    // Validate inputs
    if (!allowedTitles.includes(title)) {
      return res.status(400).json({ error: 'Invalid title' });
    }
    
    if (!cmhConfigs[cmh]) {
      return res.status(400).json({ error: 'Invalid CMH selection' });
    }
    
    const today = getTodayDateString();
    // File naming: date_cmh_title.html
    const fileName = `${today}_${cmh}_${title}.html`;
    const filePath = path.join(FILES_DIR, fileName);
    
    // Check if file with same title and CMH exists and remove it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Generate HTML content
    const htmlContent = generateHTMLContent({
      title,
      seedsInput,
      activeInput,
      sessionsOutInput,
      cmh
    });
    
    // Save file
    fs.writeFileSync(filePath, htmlContent);
    
    res.json({ 
      success: true, 
      message: 'File generated successfully',
      fileName,
      filePath,
      cmh: cmh,
      cmhName: cmhConfigs[cmh].name
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate file' });
  }
});

// Send all today's files for a specific CMH
app.post('/api/send-cmh-to-telegram', async (req, res) => {
  try {
    const { cmh } = req.body;
    
    if (!cmhConfigs[cmh]) {
      return res.status(400).json({ error: 'Invalid CMH selection' });
    }
    
    const { BOT_TOKEN, CHAT_ID, name } = cmhConfigs[cmh];
    const today = getTodayDateString();
    
    // Get all today's files for this specific CMH
    const fileNames = fs.readdirSync(FILES_DIR);
    const filesToSend = fileNames.filter(fileName => 
      fileName.startsWith(today) && fileName.includes(`_${cmh}_`)
    );
    
    if (filesToSend.length === 0) {
      return res.status(404).json({ 
        error: `No files found for ${name} today` 
      });
    }
    
    // Send each file
    const results = [];
    for (const fileName of filesToSend) {
      const filePath = path.join(FILES_DIR, fileName);
      const title = fileName.replace(`${today}_${cmh}_`, '').replace('.html', '');
      
      try {
        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        formData.append('document', fs.createReadStream(filePath));
        formData.append('caption', `📊 ${name} - ${title}\nConsumption Report - Generated on ${new Date().toLocaleDateString()}`);
        
        const response = await axios.post(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
          formData,
          { headers: formData.getHeaders() }
        );
        
        results.push({ fileName, success: true });
      } catch (error) {
        results.push({ fileName, success: false, error: error.message });
      }
    }
    
    res.json({ 
      success: true, 
      message: `Sent ${results.filter(r => r.success).length} files for ${name}`,
      cmh: cmh,
      cmhName: name,
      results 
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to send files: ' + error.message });
  }
});

// Send specific file to Telegram
app.post('/api/send-file-to-telegram', async (req, res) => {
  try {
    const { cmh, fileName } = req.body;
    
    if (!cmhConfigs[cmh]) {
      return res.status(400).json({ error: 'Invalid CMH selection' });
    }
    
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }
    
    const { BOT_TOKEN, CHAT_ID, name } = cmhConfigs[cmh];
    const filePath = path.join(FILES_DIR, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Extract title from filename
    const parts = fileName.replace('.html', '').split('_');
    const title = parts[2];
    
    // Send the file
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('document', fs.createReadStream(filePath));
    formData.append('caption', `📊 ${name} - ${title}\nConsumption Report - Generated on ${new Date().toLocaleDateString()}`);
    
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
      formData,
      { headers: formData.getHeaders() }
    );
    
    res.json({ 
      success: true, 
      message: 'File sent successfully',
      cmh: cmh,
      cmhName: name,
      fileName: fileName
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to send file: ' + error.message });
  }
});

// Get CMH configurations
app.get('/api/cmh-configs', (req, res) => {
  res.json(cmhConfigs);
});

// Get allowed titles
app.get('/api/allowed-titles', (req, res) => {
  res.json(allowedTitles);
});

// Debug endpoint to see files
app.get('/api/debug-files', (req, res) => {
  try {
    const today = getTodayDateString();
    const allFiles = fs.readdirSync(FILES_DIR);
    const todaysFiles = allFiles.filter(file => file.startsWith(today));
    
    const filesByCmh = {};
    todaysFiles.forEach(file => {
      const parts = file.replace('.html', '').split('_');
      const cmh = parts[1];
      if (!filesByCmh[cmh]) filesByCmh[cmh] = [];
      filesByCmh[cmh].push(file);
    });
    
    res.json({
      filesDirectory: FILES_DIR,
      allFiles: allFiles,
      todaysFiles: todaysFiles,
      filesByCmh: filesByCmh,
      today: today
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download file
app.get('/api/download/:fileName', (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(FILES_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download file' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});