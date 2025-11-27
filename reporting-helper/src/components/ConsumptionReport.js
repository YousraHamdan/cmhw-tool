import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const ConsumptionReport = () => {
  const [title, setTitle] = useState('OFFER AUTO');
  const [seedsInput, setSeedsInput] = useState('99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99\n99');
  const [activeInput, setActiveInput] = useState('80\n97\n83\n91\n99\n99\n99\n99\n94\n96\n98\n98\n96\n97\n98');
  const [sessionsOutInput, setSessionsOutInput] = useState('0');
  const [tableData, setTableData] = useState([]);
  const [totals, setTotals] = useState({ seeds: 0, active: 0, blocked: 0 });
  const [isSending, setIsSending] = useState(false);
  const [selectedCMH, setSelectedCMH] = useState('cmh1');
  const [todayFiles, setTodayFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // CMH configurations with Telegram credentials
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

  const availableTitles = ['IP', 'IP2', 'OFFER AUTO', 'OFFER BY REQUEST'];

  useEffect(() => {
    const initializeOnMount = () => {
      const seedsValues = parseInput(seedsInput);
      const activeValues = parseInput(activeInput);
      
      if (seedsValues.length === activeValues.length) {
        let totalSeeds = 0;
        let totalActive = 0;
        let totalBlocked = 0;
        
        const newTableData = seedsValues.map((seeds, i) => {
          const seedsNum = parseInt(seeds) || 0;
          const activeNum = parseInt(activeValues[i]) || 0;
          const blockedNum = seedsNum - activeNum;
          
          totalSeeds += seedsNum;
          totalActive += activeNum;
          totalBlocked += blockedNum;
          
          return {
            dropNumber: i + 1,
            seeds: seedsNum,
            active: activeNum,
            blocked: blockedNum
          };
        });
        
        setTableData(newTableData);
        setTotals({ seeds: totalSeeds, active: totalActive, blocked: totalBlocked });
        generateChart(newTableData);
      }
    };
    
    initializeOnMount();
    loadTodayFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTodayFiles = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storedFiles = localStorage.getItem(`consumption_files_${today}`);
      if (storedFiles) {
        setTodayFiles(JSON.parse(storedFiles));
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const saveFilesToStorage = (files) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`consumption_files_${today}`, JSON.stringify(files));
    } catch (error) {
      console.error('Error saving files:', error);
    }
  };

  const parseInput = (input) => {
    return input.split('\n')
                .map(value => value.trim())
                .filter(value => value !== '');
  };

  const generateTableAndChart = async () => {
    const seedsValues = parseInput(seedsInput);
    const activeValues = parseInput(activeInput);
    
    if (seedsValues.length !== activeValues.length) {
      alert('Error: The number of values in both columns must be the same.');
      return;
    }
    
    let totalSeeds = 0;
    let totalActive = 0;
    let totalBlocked = 0;
    
    const newTableData = seedsValues.map((seeds, i) => {
      const seedsNum = parseInt(seeds) || 0;
      const activeNum = parseInt(activeValues[i]) || 0;
      const blockedNum = seedsNum - activeNum;
      
      totalSeeds += seedsNum;
      totalActive += activeNum;
      totalBlocked += blockedNum;
      
      return {
        dropNumber: i + 1,
        seeds: seedsNum,
        active: activeNum,
        blocked: blockedNum
      };
    });
    
    setTableData(newTableData);
    setTotals({ seeds: totalSeeds, active: totalActive, blocked: totalBlocked });
    generateChart(newTableData);
    
    // Now save the file to storage after generating table and chart
    await saveFileToStorageAfterGeneration();
  };

  const saveFileToStorageAfterGeneration = async () => {
    if (!availableTitles.includes(title)) {
      alert('Please select a valid title from the dropdown');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const fileName = `${today}_${selectedCMH}_${title}.html`;
      const cmhName = cmhConfigs[selectedCMH]?.name || selectedCMH;

      // Generate HTML content using the same function as backend
      const htmlContent = generateHTMLContent({
        title,
        seedsInput,
        activeInput,
        sessionsOutInput,
        cmh: selectedCMH
      });

      // Create file object
      const newFile = {
        fileName,
        title,
        cmh: selectedCMH,
        cmhName,
        createdAt: new Date().toISOString(),
        htmlContent,
        // Store raw data for combined reports
        seedsInput,
        activeInput,
        sessionsOutInput
      };

      // Update files list
      const updatedFiles = [...todayFiles.filter(f => 
        !(f.cmh === selectedCMH && f.title === title)
      ), newFile];
      
      setTodayFiles(updatedFiles);
      saveFilesToStorage(updatedFiles);

      alert('Table, Chart and File generated and saved successfully!');
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file. Please check console for details.');
    }
  };

  const generateChart = (data) => {
    if (!chartRef.current) {
      console.error('Chart canvas not found');
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }

    const ctx = chartRef.current.getContext('2d');
    
    const drops = data.map(row => `Drop ${row.dropNumber}`);
    const activeData = data.map(row => row.active);
    const blockedData = data.map(row => row.blocked);

    try {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: drops,
          datasets: [
            {
              label: 'Seeds Active',
              data: activeData,
              backgroundColor: 'rgba(5, 150, 105, 0.7)',
              borderColor: 'rgba(5, 150, 105, 1)',
              borderWidth: 1
            },
            {
              label: 'Seeds Blocked',
              data: blockedData,
              backgroundColor: 'rgba(220, 38, 38, 0.7)',
              borderColor: 'rgba(220, 38, 38, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Drops'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Seeds'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Active vs Blocked Seeds by Drop'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  };

  const clearData = () => {
    setSeedsInput('');
    setActiveInput('');
    setSessionsOutInput('');
    setTitle('OFFER AUTO');
    setTableData([]);
    setTotals({ seeds: 0, active: 0, blocked: 0 });
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  };

  // Generate individual HTML content (EXACT SAME as backend)
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
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); color: #2d3748; line-height: 1.4; padding: 8px; font-size: 11px; height: 100vh; overflow: hidden; }
  .container { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; height: 100%; max-height: 100vh; }
  .header { grid-column: 1 / -1; text-align: center; margin-bottom: 8px; padding: 8px; border-bottom: 2px solid #2c5282; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
  .cmh-badge { background: linear-gradient(135deg, #2c5282, #1a365d); color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.7rem; margin-bottom: 4px; display: inline-block; font-weight: 600; }
  .title { font-size: 1.3rem; font-weight: 700; background: linear-gradient(135deg, #2c5282, #38a169); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 4px; }
  .subtitle { color: #718096; font-size: 0.7rem; }
  .left-panel { display: flex; flex-direction: column; gap: 12px; }
  .stats-panel { background: white; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
  .stat-item { margin-bottom: 8px; padding: 6px 0; border-bottom: 1px solid #f7fafc; display: flex; justify-content: space-between; align-items: center; }
  .stat-value { font-weight: 700; color: #2c5282; font-size: 0.9rem; }
  .diagram-container { background: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 12px; border: 1px solid #e2e8f0; flex-grow: 1; display: flex; flex-direction: column; }
  .diagram-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: #2d3748; text-align: center; }
  .chart-container { position: relative; width: 140px; height: 140px; margin: 0 auto; }
  .pie-chart { width: 100%; height: 100%; position: relative; border-radius: 50%; background: conic-gradient( #38a169 0% ${activePercentage}%, #e53e3e ${activePercentage}% 100% ); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05); animation: rotate 3s ease-in-out; transform-origin: center; }
  @keyframes rotate {
    0% { transform: scale(0.8) rotate(-90deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  .chart-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: white; border-radius: 50%; box-shadow: 0 0 8px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; border: 1px solid #e2e8f0; }
  .total-count { font-size: 0.9rem; font-weight: 700; color: #2c5282; line-height: 1; }
  .total-label { font-size: 0.6rem; color: #718096; margin-top: 2px; }
  .diagram-legend { margin-top: 10px; }
  .legend-item { display: flex; align-items: center; margin-bottom: 6px; padding: 6px 8px; border-radius: 6px; background: #f7fafc; border: 1px solid #e2e8f0; transition: transform 0.2s ease; }
  .legend-item:hover { transform: translateX(4px); }
  .legend-color { width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); }
  .legend-label { flex: 1; font-size: 0.7rem; font-weight: 500; }
  .legend-percentage { font-weight: 700; color: #2c5282; margin-left: 3px; font-size: 0.7rem; }
  .legend-count { font-size: 0.65rem; color: #718096; margin-left: 3px; }
  .table-container { background: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 12px; border: 1px solid #e2e8f0; overflow: auto; height: 100%; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-radius: 6px; overflow: hidden; }
  th { padding: 6px 4px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: white; font-size: 0.7rem; position: sticky; top: 0; }
  th:nth-child(1) { background: linear-gradient(135deg, #2c5282, #1a365d); } /* Drop N° */
  th:nth-child(2) { background: linear-gradient(135deg, #2c5282, #1a365d); } /* Consumption Seeds */
  th:nth-child(3) { background: linear-gradient(135deg, #38a169, #2f855a); } /* Active/Drop - Green */
  th:nth-child(4) { background: linear-gradient(135deg, #e53e3e, #c53030); } /* Blocked - Red */
  td { padding: 4px; border-bottom: 1px solid #f7fafc; font-size: 0.65rem; }
  td:nth-child(3) { background-color: rgba(56, 161, 105, 0.1); color: #2f855a; font-weight: 500; } /* Active cells - light green */
  td:nth-child(4) { background-color: rgba(229, 62, 62, 0.1); color: #c53030; font-weight: 500; } /* Blocked cells - light red */
  .totals-row { background: linear-gradient(135deg, rgba(44, 82, 130, 0.1), rgba(56, 161, 105, 0.1)); font-weight: 600; position: sticky; bottom: 0; }
  .totals-row td { border-top: 2px solid #e2e8f0; padding: 6px 4px; }
  footer { grid-column: 1 / -1; text-align: center; margin-top: 8px; padding: 6px; color: #718096; border-top: 1px solid #e2e8f0; font-size: 0.65rem; background: white; border-radius: 4px; }
</style>
</head>
<body class="with-footer">
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
        <div class="stat-item"><span>Sessions Out: </span><span class="stat-value">${sessionsOutInput}</span></div>
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
            <div class="legend-color" style="background-color: #38a169;"></div>
            <span class="legend-label">Active Seeds</span>
            <span class="legend-percentage">${activePercentage}%</span>
            <span class="legend-count">(${totalActive})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #e53e3e;"></div>
            <span class="legend-label">Blocked Seeds</span>
            <span class="legend-percentage">${blockedPercentage}%</span>
            <span class="legend-count">(${totalBlocked})</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <h3 style="margin-bottom: 8px; color: #2d3748;">Detailed Data</h3>
      <table class="${seedsValues.length > 15 ? 'compact-table' : ''}">
        <thead>
          <tr>
            <th style="width: 15%">Drop N°</th>
            <th style="width: 25%">Consumption Seeds</th>
            <th style="width: 20%">Active/Drop</th>
            <th style="width: 20%">Blocked</th>
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
              </tr>
            `;
          }).join('')}
          <tr class="totals-row">
            <td colspan="2">TOTAL: ${totalSeeds}</td>
            <td>ACTIVE: ${totalActive}</td>
            <td>BLOCKED: ${totalBlocked}</td>
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

  // Generate combined HTML (EXACT SAME as backend)
  const generateCombinedHTML = (cmh, filesData) => {
    const cmhName = cmhConfigs[cmh]?.name || cmh;
    const combinedGeneratedDate = new Date().toLocaleDateString('en-GB');
    
    const resumeData = filesData.map((file, fileIndex) => {
      const seedsValues = file.seedsInput.split('\n').map(v => parseInt(v.trim()) || 0).filter(v => !isNaN(v));
      const activeValues = file.activeInput.split('\n').map(v => parseInt(v.trim()) || 0).filter(v => !isNaN(v));
      
      let totalSeeds = 0;
      let totalActive = 0;
      let totalBlocked = 0;
      
      seedsValues.forEach((seeds, i) => {
        const seedsNum = seeds;
        const activeNum = activeValues[i] || 0;
        const blockedNum = seedsNum - activeNum;
        
        totalSeeds += seedsNum;
        totalActive += activeNum;
        totalBlocked += blockedNum;
      });

      const activePercentage = totalSeeds > 0 ? Math.round((totalActive/totalSeeds)*100) : 0;
      const blockedPercentage = totalSeeds > 0 ? Math.round((totalBlocked/totalSeeds)*100) : 0;

      return {
        title: file.title,
        totalSeeds,
        totalActive,
        totalBlocked,
        activePercentage,
        blockedPercentage,
        sessionsOut: file.sessionsOutInput,
        seedsValues,
        activeValues,
        fileIndex
      };
    });

    const gridColumns = resumeData.length <= 2 ? '1fr 1fr' : 
                       resumeData.length === 3 ? '1fr 1fr 1fr' : 
                       '1fr 1fr 1fr 1fr';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cmhName} - Combined Consumption Reports</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
    color: #2d3748; 
    line-height: 1.4; 
    padding: 8px; 
    font-size: 11px; 
    height: 100vh; 
    overflow: hidden; 
  }
  
  .nav-header { 
    text-align: center; 
    margin-bottom: 8px; 
    padding: 12px; 
    border-bottom: 2px solid #2c5282; 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cmh-badge { 
    background: linear-gradient(135deg, #2c5282, #1a365d); 
    color: white; 
    padding: 6px 16px; 
    border-radius: 6px; 
    font-size: 0.9rem; 
    font-weight: 600; 
  }
  .nav-controls { 
    display: flex; 
    align-items: center; 
    gap: 12px; 
  }
  .nav-btn { 
    background: linear-gradient(135deg, #2c5282, #1a365d);
    color: white; 
    border: none; 
    padding: 8px 16px; 
    border-radius: 6px; 
    cursor: pointer; 
    font-size: 0.8rem; 
    font-weight: 600; 
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .nav-btn:hover { 
    background: linear-gradient(135deg, #1a365d, #2c5282);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  .nav-btn:disabled { 
    background: #a0aec0; 
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .current-report { 
    font-weight: 700; 
    color: #2c5282; 
    font-size: 1.1rem;
    background: linear-gradient(135deg, #2c5282, #38a169);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    padding: 0 16px;
  }
  
  .tab-nav { 
    display: flex; 
    gap: 8px; 
    margin-bottom: 12px;
    background: white;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }
  .tab-btn { 
    background: #e2e8f0; 
    border: none; 
    padding: 8px 16px; 
    border-radius: 6px; 
    cursor: pointer; 
    font-size: 0.8rem; 
    font-weight: 600; 
    transition: all 0.3s ease;
  }
  .tab-btn.active { 
    background: linear-gradient(135deg, #2c5282, #1a365d); 
    color: white; 
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  .tab-btn:hover { 
    background: #cbd5e0; 
    transform: translateY(-1px);
  }
  .tab-btn.active:hover { 
    background: linear-gradient(135deg, #1a365d, #2c5282);
  }
  
  .main-container { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 12px; 
    height: calc(100vh - 150px); 
    max-height: calc(100vh - 150px); 
    min-height: calc(100vh - 150px);
  }
  
  .resume-grid {
    display: grid;
    grid-template-columns: ${gridColumns};
    gap: 12px;
    height: 100%;
    grid-column: 1 / -1;
    min-height: 0;
  }
  
  .resume-card { 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }
  
  .report-page { 
    display: none; 
    height: 100%;
    min-height: 0;
  }
  .report-page.active { 
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr auto;
    gap: 12px;
    height: 100%;
    grid-column: 1 / -1;
    min-height: 0;
  }
  
  .left-panel { 
    display: flex; 
    flex-direction: column; 
    gap: 12px; 
    grid-row: 2;
    grid-column: 1;
    min-height: 0;
  }
  
  .header { 
    grid-column: 1 / -1; 
    text-align: center; 
    margin-bottom: 8px; 
    padding: 8px; 
    border-bottom: 2px solid #2c5282; 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
  }
  .cmh-badge-small { 
    background: linear-gradient(135deg, #2c5282, #1a365d); 
    color: white; 
    padding: 4px 12px; 
    border-radius: 6px; 
    font-size: 0.7rem; 
    margin-bottom: 4px; 
    display: inline-block; 
    font-weight: 600; 
  }
  .title { 
    font-size: 1.3rem; 
    font-weight: 700; 
    background: linear-gradient(135deg, #2c5282, #38a169); 
    -webkit-background-clip: text; 
    background-clip: text; 
    color: transparent; 
    margin-bottom: 4px; 
  }
  .subtitle { 
    color: #718096; 
    font-size: 0.7rem; 
  }
  
  .stats-panel { 
    background: white; 
    border-radius: 8px; 
    padding: 12px; 
    border: 1px solid #e2e8f0; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
  }
  .stat-item { 
    margin-bottom: 8px; 
    padding: 6px 0; 
    border-bottom: 1px solid #f7fafc; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
  }
  .stat-value { 
    font-weight: 700; 
    color: #2c5282; 
    font-size: 0.9rem; 
  }
  
  .diagram-container { 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    padding: 12px; 
    border: 1px solid #e2e8f0; 
    flex-grow: 1; 
    display: flex; 
    flex-direction: column; 
    justify-content: center;
    align-items: center;
    min-height: 0;
    gap: 8px;
  }
  .diagram-title { 
    font-size: 0.85rem; 
    font-weight: 600; 
    color: #2d3748; 
    text-align: center; 
    margin: 0;
  }
  
  .chart-container { 
    position: relative; 
    width: 160px; 
    height: 160px; 
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .pie-chart { 
    width: 100%; 
    height: 100%; 
    position: relative; 
    border-radius: 50%; 
    background: conic-gradient( #38a169 0% var(--active-percentage)%, #e53e3e var(--active-percentage)% 100% ); 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05); 
    animation: pieGrow 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
               rotate 2s ease-in-out,
               glow 3s ease-in-out infinite alternate;
    transform-origin: center; 
    opacity: 0;
    animation-fill-mode: forwards;
  }
  
  @keyframes pieGrow {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes rotate {
    0% { transform: rotate(-180deg) scale(0); }
    100% { transform: rotate(0deg) scale(1); }
  }
  
  @keyframes glow {
    0% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05); }
    100% { box-shadow: 0 6px 20px rgba(56, 161, 105, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.1); }
  }
  
  .chart-center { 
    position: absolute; 
    top: 50%; 
    left: 50%; 
    transform: translate(-50%, -50%); 
    width: 70px; 
    height: 70px; 
    background: white; 
    border-radius: 50%; 
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1); 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    z-index: 10; 
    border: 1px solid #e2e8f0; 
    animation: centerPop 1s ease-in-out 0.5s both;
  }
  
  @keyframes centerPop {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
    70% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
  
  .total-count { 
    font-size: 1rem; 
    font-weight: 700; 
    color: #2c5282; 
    line-height: 1; 
    animation: countFade 1s ease-in-out 1s both;
  }
  
  @keyframes countFade {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .total-label { 
    font-size: 0.65rem; 
    color: #718096; 
    margin-top: 2px; 
    animation: labelFade 1s ease-in-out 1.2s both;
  }
  
  @keyframes labelFade {
    0% { opacity: 0; transform: translateY(5px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .diagram-legend { 
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 100%;
    max-width: 200px;
  }
  .legend-item { 
    display: flex; 
    align-items: center; 
    padding: 6px 12px; 
    border-radius: 6px; 
    background: #f7fafc; 
    border: 1px solid #e2e8f0; 
    transition: transform 0.2s ease; 
    animation: legendSlide 0.5s ease-in-out both;
    width: 100%;
    justify-content: space-between;
  }
  .legend-item:nth-child(1) { animation-delay: 1.4s; }
  .legend-item:nth-child(2) { animation-delay: 1.6s; }
  
  @keyframes legendSlide {
    0% { opacity: 0; transform: translateX(-20px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  
  .legend-item:hover { 
    transform: translateX(4px); 
  }
  .legend-color { 
    width: 12px; 
    height: 12px; 
    border-radius: 50%; 
    margin-right: 8px; 
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); 
    flex-shrink: 0;
  }
  .legend-label { 
    font-size: 0.75rem; 
    font-weight: 500; 
    flex: 1;
  }
  .legend-percentage { 
    font-weight: 700; 
    color: #2c5282; 
    margin-left: 3px; 
    font-size: 0.75rem; 
  }
  .legend-count { 
    font-size: 0.7rem; 
    color: #718096; 
    margin-left: 3px; 
  }
  
  .table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    height: 100%;
    grid-row: 2;
    grid-column: 2;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .table-title {
    margin-bottom: 12px;
    color: #2d3748;
    text-align: center;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .table-wrapper {
    flex: 1;
    overflow: auto;
    position: relative;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    margin: auto 0;
  }

  th {
    padding: 8px 6px;
    text-align: center;
    border-bottom: 2px solid #e2e8f0;
    font-weight: 600;
    color: white;
    font-size: 0.75rem;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  th:nth-child(1) { background: linear-gradient(135deg, #2c5282, #1a365d); }
  th:nth-child(2) { background: linear-gradient(135deg, #2c5282, #1a365d); }
  th:nth-child(3) { background: linear-gradient(135deg, #38a169, #2f855a); }
  th:nth-child(4) { background: linear-gradient(135deg, #e53e3e, #c53030); }

  td {
    padding: 6px 4px;
    border-bottom: 1px solid #f7fafc;
    font-size: 0.7rem;
    text-align: center;
  }

  td:nth-child(3) {
    background-color: rgba(56, 161, 105, 0.1);
    color: #2f855a;
    font-weight: 500;
  }

  td:nth-child(4) {
    background-color: rgba(229, 62, 62, 0.1);
    color: #c53030;
    font-weight: 500;
  }

  .totals-row {
    background: linear-gradient(135deg, rgba(44, 82, 130, 0.1), rgba(56, 161, 105, 0.1));
    font-weight: 600;
    position: sticky;
    bottom: 0;
    z-index: 5;
  }

  .totals-row td {
    border-top: 2px solid #e2e8f0;
    padding: 8px 4px;
    background: inherit;
    text-align: center;
    font-size: 0.75rem;
  }
  
  .fixed-footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(44,82,130,0.95), rgba(56,161,105,0.95));
    color: white;
    padding: 10px 16px;
    text-align: center;
    font-weight: 700;
    font-size: 0.9rem;
    z-index: 9999;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
  }
  body.with-footer { padding-bottom: 56px; }

  footer { 
    grid-column: 1 / -1; 
    text-align: center; 
    margin-top: 8px; 
    padding: 6px; 
    color: #718096; 
    border-top: 1px solid #e2e8f0; 
    font-size: 0.65rem; 
    background: white; 
    border-radius: 4px; 
    grid-row: 3;
  }
  
  .view-details-btn {
    background: linear-gradient(135deg, #38a169, #2f855a);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-top: auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
  }
  .view-details-btn:hover {
    background: linear-gradient(135deg, #2f855a, #38a169);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
</style>
</head>
<body>
  <div class="nav-header">
    <div class="cmh-badge">${cmhName}</div>
    <div class="nav-controls">
      <button class="nav-btn" onclick="prevReport()" id="prevBtn">← Previous</button>
      <span class="current-report" id="currentReport">Resume Overview</span>
      <button class="nav-btn" onclick="nextReport()" id="nextBtn">Next →</button>
    </div>
  </div>
  
  <div class="tab-nav">
    <button class="tab-btn active" onclick="showTab('resume')">📊 Resume Overview</button>
    ${filesData.map((file, index) => `
      <button class="tab-btn" onclick="showTab('report${index}')">${file.title}</button>
    `).join('')}
  </div>

  <div class="main-container">
    <!-- Resume Page -->
    <div id="resume" class="report-page active">
      <div class="resume-grid">
        ${resumeData.map(data => `
          <div class="resume-card">
            <div class="header">
              <div class="cmh-badge-small">${cmhName}</div>
              <div class="title">${data.title}</div>
              <div class="subtitle">Consumption Report</div>
            </div>
            
            <div class="left-panel">
              <div class="stats-panel">
                <div class="stat-item"><span>Total Consumption: </span><span class="stat-value">${data.totalSeeds}</span></div>
                <div class="stat-item"><span>Total Seeds Active: </span><span class="stat-value">${data.totalActive}</span></div>
                <div class="stat-item"><span>Total Seeds Blocked: </span><span class="stat-value">${data.totalBlocked}</span></div>
                <div class="stat-item"><span>Sessions Out: </span><span class="stat-value">${data.sessionsOut}</span></div>
              </div>
              
              <div class="diagram-container">
                <h3 class="diagram-title">Consumption Overview</h3>
                <div class="chart-container">
                  <div class="pie-chart" style="--active-percentage: ${data.activePercentage}%; background: conic-gradient(#38a169 0% ${data.activePercentage}%, #e53e3e ${data.activePercentage}% 100%);">
                    <div class="chart-center">
                      <div class="total-count">${data.totalSeeds}</div>
                      <div class="total-label">Total</div>
                    </div>
                  </div>
                </div>
                <div class="diagram-legend">
                  <div class="legend-item">
                    <div class="legend-color" style="background-color: #38a169;"></div>
                    <span class="legend-label">Active Seeds</span>
                    <span class="legend-percentage">${data.activePercentage}%</span>
                    <span class="legend-count">(${data.totalActive})</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color" style="background-color: #e53e3e;"></div>
                    <span class="legend-label">Blocked Seeds</span>
                    <span class="legend-percentage">${data.blockedPercentage}%</span>
                    <span class="legend-count">(${data.totalBlocked})</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="padding: 12px; border-top: 1px solid #e2e8f0;">
              <button class="view-details-btn" onclick="showTab('report${data.fileIndex}')">
                View Detailed Report
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Individual Report Pages -->
    ${filesData.map((file, index) => {
      const seedsValues = file.seedsInput.split('\n').map(v => parseInt(v.trim()) || 0).filter(v => !isNaN(v));
      const activeValues = file.activeInput.split('\n').map(v => parseInt(v.trim()) || 0).filter(v => !isNaN(v));
      
      let totalSeeds = 0;
      let totalActive = 0;
      let totalBlocked = 0;
      
      seedsValues.forEach((seeds, i) => {
        const seedsNum = seeds;
        const activeNum = activeValues[i] || 0;
        const blockedNum = seedsNum - activeNum;
        
        totalSeeds += seedsNum;
        totalActive += activeNum;
        totalBlocked += blockedNum;
      });

      const activePercentage = totalSeeds > 0 ? Math.round((totalActive/totalSeeds)*100) : 0;
      const blockedPercentage = totalSeeds > 0 ? Math.round((totalBlocked/totalSeeds)*100) : 0;

      return `
        <div id="report${index}" class="report-page">
          <!-- HEADER -->
          <div class="header">
            <div class="cmh-badge-small">${cmhName}</div>
            <h1 class="title">${file.title}</h1>
            <p class="subtitle">Consumption Report - Generated on ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
          
          <!-- LEFT PANEL WITH CENTERED CHART -->
          <div class="left-panel">
            <div class="stats-panel">
              <div class="stat-item"><span>Total Consumption: </span><span class="stat-value">${totalSeeds}</span></div>
              <div class="stat-item"><span>Total Seeds Active: </span><span class="stat-value">${totalActive}</span></div>
              <div class="stat-item"><span>Total Seeds Blocked: </span><span class="stat-value">${totalBlocked}</span></div>
              <div class="stat-item"><span>Sessions Out: </span><span class="stat-value">${file.sessionsOutInput}</span></div>
            </div>
            
            <div class="diagram-container">
              <h3 class="diagram-title">Consumption Overview</h3>
              <div class="chart-container">
                <div class="pie-chart" style="--active-percentage: ${activePercentage}%; background: conic-gradient(#38a169 0% ${activePercentage}%, #e53e3e ${activePercentage}% 100%);">
                  <div class="chart-center">
                    <div class="total-count">${totalSeeds}</div>
                    <div class="total-label">Total</div>
                  </div>
                </div>
              </div>
              <div class="diagram-legend">
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #38a169;"></div>
                  <span class="legend-label">Active Seeds</span>
                  <span class="legend-percentage">${activePercentage}%</span>
                  <span class="legend-count">(${totalActive})</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: #e53e3e;"></div>
                  <span class="legend-label">Blocked Seeds</span>
                  <span class="legend-percentage">${blockedPercentage}%</span>
                  <span class="legend-count">(${totalBlocked})</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- TABLE CONTAINER WITH CENTERED CONTENT -->
          <div class="table-container">
            <h3 class="table-title">Detailed Data</h3>
            <div class="table-wrapper">
              <table class="${seedsValues.length > 15 ? 'compact-table' : ''}">
                <thead>
                  <tr>
                    <th style="width: 20%">Drop N°</th>
                    <th style="width: 30%">Consumption Seeds</th>
                    <th style="width: 25%">Active/Drop</th>
                    <th style="width: 25%">Blocked</th>
                  </tr>
                </thead>
                <tbody>
                  ${seedsValues.map((seeds, i) => {
                    const dropNumber = i + 1;
                    const active = activeValues[i] || 0;
                    const blocked = seeds - active;
                    return `
                      <tr>
                        <td>${dropNumber}</td>
                        <td>${seeds}</td>
                        <td>${active}</td>
                        <td>${blocked}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr class="totals-row">
                    <td colspan="2">TOTAL: ${totalSeeds}</td>
                    <td>ACTIVE: ${totalActive}</td>
                    <td>BLOCKED: ${totalBlocked}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <!-- FOOTER -->
          <footer><p>CMHW - ${cmhName}</p></footer>
        </div>
      `;
    }).join('')}
  </div>

  <script>
    let currentTab = 'resume';
    const tabs = ['resume', ${filesData.map((_, index) => `'report${index}'`).join(', ')}];
    const reportTitles = ${JSON.stringify(filesData.map(f => f.title))};
    
    function showTab(tabName) {
      // Hide all tabs
      document.querySelectorAll('.report-page').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Show selected tab
      document.getElementById(tabName).classList.add('active');
      document.querySelector(\`[onclick="showTab('\${tabName}')"]\`).classList.add('active');
      
      currentTab = tabName;
      updateNavigation();
      
      // Reset animations when switching tabs
      if (tabName !== 'resume') {
        const pieCharts = document.querySelectorAll(\`#\${tabName} .pie-chart\`);
        pieCharts.forEach(chart => {
          chart.style.animation = 'none';
          setTimeout(() => {
            chart.style.animation = '';
          }, 10);
        });
      }
    }
    
    function nextReport() {
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex < tabs.length - 1) {
        showTab(tabs[currentIndex + 1]);
      }
    }
    
    function prevReport() {
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex > 0) {
        showTab(tabs[currentIndex - 1]);
      }
    }
    
    function updateNavigation() {
      const currentIndex = tabs.indexOf(currentTab);
      document.getElementById('prevBtn').disabled = currentIndex === 0;
      document.getElementById('nextBtn').disabled = currentIndex === tabs.length - 1;
      
      if (currentTab === 'resume') {
        document.getElementById('currentReport').textContent = 'Resume Overview';
      } else {
        const reportIndex = parseInt(currentTab.replace('report', ''));
        document.getElementById('currentReport').textContent = reportTitles[reportIndex];
      }
    }
    
    // Initialize navigation
    updateNavigation();
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevReport();
      } else if (e.key === 'ArrowRight') {
        nextReport();
      }
    });
  </script>
  <div class="fixed-footer">Generated by CMHW TEAM ON ${combinedGeneratedDate}</div>
</body>
</html>
  `;
  };

  // Telegram sending function (replaces backend API call)
  const sendToTelegramHandler = async () => {
    if (todayFiles.length === 0) {
      alert('No files available to send');
      return;
    }

    setIsSending(true);
    try {
      const cmhConfig = cmhConfigs[selectedCMH];
      if (!cmhConfig) {
        alert('Invalid CMH configuration');
        return;
      }

      const { BOT_TOKEN, CHAT_ID, name } = cmhConfig;
      const today = new Date().toISOString().split('T')[0];

      // Get files for selected CMH
      const cmhFiles = todayFiles.filter(file => file.cmh === selectedCMH);
      
      if (cmhFiles.length === 0) {
        alert(`No files found for ${name} today`);
        return;
      }

      // Generate combined HTML (same as backend)
      const filesToCombine = cmhFiles.map(file => ({
        title: file.title,
        seedsInput: file.seedsInput,
        activeInput: file.activeInput,
        sessionsOutInput: file.sessionsOutInput
      }));

      const combinedHTML = generateCombinedHTML(selectedCMH, filesToCombine);
      const combinedFileName = `${today}_${selectedCMH}_COMBINED.html`;

      // Create FormData for Telegram API
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      
      // Create blob from HTML content
      const blob = new Blob([combinedHTML], { type: 'text/html' });
      formData.append('document', blob, combinedFileName);
      
      formData.append('caption', `📊 ${name} - Combined Reports\nAll consumption reports in one file - Generated on ${new Date().toLocaleDateString()}`);

      // Send to Telegram using fetch
      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      if (response.ok && result.ok) {
        alert(`Combined file sent successfully for ${name}`);
      } else {
        alert('Failed to send to Telegram: ' + (result.description || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      alert('Error sending files to Telegram: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const downloadFile = (fileName) => {
    const file = todayFiles.find(f => f.fileName === fileName);
    if (!file) {
      alert('File not found');
      return;
    }

    const blob = new Blob([file.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteFile = (fileName) => {
    if (!window.confirm('Are you sure you want to delete this file? This cannot be undone.'))
      return;

    const updatedFiles = todayFiles.filter(f => f.fileName !== fileName);
    setTodayFiles(updatedFiles);
    saveFilesToStorage(updatedFiles);
    if (selectedFile && selectedFile.fileName === fileName) setSelectedFile(null);
    alert('File deleted successfully!');
  };

  return (
    <section id="consumption-section" className="content-section active">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Consumption Report Generator</h1>
          <p className="dashboard-subtitle">
            {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>

        {/* Today's Generated Files */}
        <div className="files-panel" style={{
          background: 'white',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          border: '1px solid #e1e5e9'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>Today's Generated Files</h3>
          {todayFiles.length === 0 ? (
            <p style={{ color: 'var(--muted-color)', fontStyle: 'italic' }}>No files generated today</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {todayFiles.map((file, index) => (
                <div key={index} style={{
                  background: 'var(--bg-color)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{file.cmhName}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted-color)' }}>{file.title}</span>
                  </div>
                  <button 
                    onClick={() => downloadFile(file.fileName)}
                    style={{
                      background: 'var(--secondary)',
                      color: 'var(--light-text)',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => deleteFile(file.fileName)}
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--light-text)',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-input-section">
          <div className="input-row">
            <label htmlFor="title-select" className="input-label">Report Title</label>
            <select 
              id="title-select"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '10px',
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                transition: 'var(--transition)',
                fontSize: '11.2px',
                fontWeight: '600'
              }}
            >
              {availableTitles.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="input-row">
            <label htmlFor="cmh-select" className="input-label">Select CMH</label>
            <select 
              id="cmh-select"
              value={selectedCMH}
              onChange={(e) => setSelectedCMH(e.target.value)}
              style={{
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '10px',
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                transition: 'var(--transition)',
                fontSize: '11.2px',
                fontWeight: '600'
              }}
            >
              <option value="cmh1">CMH 1</option>
              <option value="cmh2">CMH 2</option>
              <option value="cmh3">CMH 3</option>
            </select>
          </div>
          
          <div className="results-row">
            <div className="input-row" style={{ flex: 1 }}>
              <label htmlFor="seeds-input" className="input-label">Consommation Seeds (Active + Blocked)</label>
              <textarea 
                className="dashboard-textarea" 
                id="seeds-input" 
                placeholder="Enter values (one per line)"
                value={seedsInput}
                onChange={(e) => setSeedsInput(e.target.value)}
              />
            </div>
            <div className="input-row" style={{ flex: 1 }}>
              <label htmlFor="active-input" className="input-label">Nbr Boites Active/Drop</label>
              <textarea 
                className="dashboard-textarea" 
                id="active-input" 
                placeholder="Enter values (one per line)"
                value={activeInput}
                onChange={(e) => setActiveInput(e.target.value)}
              />
            </div>
            <div className="input-row" style={{ flex: 1 }}>
              <label htmlFor="sessions-out-input" className="input-label">Sessions Out (text for all drops)</label>
              <textarea 
                className="dashboard-textarea" 
                id="sessions-out-input" 
                placeholder="Enter text for sessions out"
                value={sessionsOutInput}
                onChange={(e) => setSessionsOutInput(e.target.value)}
              />
            </div>
          </div>

          <div className="dashboard-buttons">
            <button id="generate-btn" className="btn-generate" onClick={generateTableAndChart}>
              Generate Table & Chart
            </button>
            <button id="clear-btn" className="btn-clear" onClick={clearData}>
              Clear
            </button>
            <button 
              id="telegram-btn" 
              className="btn-telegram" 
              onClick={sendToTelegramHandler}
              disabled={isSending || todayFiles.length === 0}
              style={{
                backgroundColor: '#0088cc',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 'var(--border-radius)',
                cursor: (isSending || todayFiles.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (isSending || todayFiles.length === 0) ? 0.6 : 1
              }}
            >
              {isSending ? `Sending...` : `Send ${selectedCMH.toUpperCase()} Files`}
            </button>
          </div>
        </div>

        {/* Rest of your existing JSX for chart and table remains exactly the same */}
        <div className="results-row">
          <div className="dashboard-chart-container" style={{ flex: 2 }}>
            <div className="dashboard-chart-header">
              <h3 className="dashboard-chart-title">Consumption Overview</h3>
              <div className="dashboard-stats-panel">
                <div className="dashboard-stat-item">
                  <span>Total Consumption: </span>
                  <span className="dashboard-stat-value">
                    {totals.seeds}
                  </span>
                </div>
                <div className="dashboard-stat-item">
                  <span>Total Seeds Active: </span>
                  <span className="dashboard-stat-value">
                    {totals.active}
                  </span>
                </div>
                <div className="dashboard-stat-item">
                  <span>Total Seeds Blocked: </span>
                  <span className="dashboard-stat-value">
                    {totals.blocked}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ height: '400px', position: 'relative' }}>
              <canvas id="consumption-chart" ref={chartRef}></canvas>
            </div>
          </div>
        </div>

        <div className="dashboard-table-container">
          <h3 className="dashboard-chart-title">Detailed Data</h3>
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Drop N°</th>
                  <th>CONSOMMATION SEEDS (ACTIVE+BLOCKED)</th>
                  <th>Nbr BOITES ACTIVE/DROP</th>
                  <th>Nbr BOITES BLOCKED</th>
                  <th>SESSIONS OUT</th>
                </tr>
              </thead>
              <tbody id="table-body">
                {tableData.map(row => (
                  <tr key={row.dropNumber}>
                    <td>Drop N° {row.dropNumber}</td>
                    <td>{row.seeds}</td>
                    <td>{row.active}</td>
                    <td>{row.blocked}</td>
                    <td>{sessionsOutInput}</td>
                  </tr>
                ))}
                {tableData.length > 0 && (
                  <tr className="totals-row">
                    <td colSpan="2">TOTAL CONSOMMATION: {totals.seeds}</td>
                    <td>TOTAL SEEDS ACTIVE: {totals.active}</td>
                    <td>TOTAL SEEDS BLOCKED: {totals.blocked}</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsumptionReport;