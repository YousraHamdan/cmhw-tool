import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { generateHTMLContent, generateCombinedHTML, parseInput, generateTableData, cmhConfigs } from '../utils/htmlGenerator';
import { sendToTelegram } from '../utils/telegramIntegration';

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

  const availableTitles = ['IP', 'IP2', 'OFFER AUTO', 'OFFER BY REQUEST'];

  useEffect(() => {
    const initializeOnMount = () => {
      const seedsValues = parseInput(seedsInput);
      const activeValues = parseInput(activeInput);
      
      if (seedsValues.length === activeValues.length) {
        // Use utility function to generate table data
        const { tableData: newTableData, totals: newTotals } = generateTableData(seedsInput, activeInput, sessionsOutInput);
        setTableData(newTableData);
        setTotals(newTotals);
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

  const generateTableAndChart = async () => {
    const seedsValues = parseInput(seedsInput);
    const activeValues = parseInput(activeInput);
    
    if (seedsValues.length !== activeValues.length) {
      alert('Error: The number of values in both columns must be the same.');
      return;
    }
    
    // Use utility function to generate table data
    const { tableData: newTableData, totals: newTotals } = generateTableData(seedsInput, activeInput, sessionsOutInput);
    
    setTableData(newTableData);
    setTotals(newTotals);
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

      const { name } = cmhConfig;

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

      // Use utility function to send to Telegram
      const result = await sendToTelegram(selectedCMH, combinedHTML, cmhFiles);

      if (result.success) {
        alert(`Combined file sent successfully for ${name}`);
      } else {
        alert('Failed to send to Telegram: ' + (result.error || 'Unknown error'));
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
              <option value="cmh5">CMH 5</option>
              <option value="cmh6">CMH 6</option>
              <option value="cmh8">CMH 8</option>
              <option value="cmh9">CMH 9</option>
              <option value="cmh12">CMH 12</option>
              <option value="cmh16">CMH 16</option>
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