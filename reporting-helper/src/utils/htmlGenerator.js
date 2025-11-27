/**
 * HTML generation utilities for consumption reports
 * Replaces backend HTML generation
 */

const cmhConfigs = {
  cmh1: {
    name: 'test'
  },
  cmh2: {
    name: 'CMH 2'
  },
  cmh3: {
    name: 'CMH 3'
  }
};

/**
 * Parse newline-separated input string into array of numbers
 */
const parseInput = (input) => {
  return input
    .split('\n')
    .map(value => value.trim())
    .filter(value => value !== '');
};

/**
 * Generate individual report HTML content
 */
export const generateHTMLContent = (data) => {
  const { title, seedsInput, activeInput, sessionsOutInput, cmh } = data;
  
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

  const activePercentage = totalSeeds > 0 ? Math.round((totalActive / totalSeeds) * 100) : 0;
  const blockedPercentage = totalSeeds > 0 ? Math.round((totalBlocked / totalSeeds) * 100) : 0;

  const cmhName = cmhConfigs[cmh]?.name || cmh;

  return `<!DOCTYPE html>
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
  th:nth-child(1) { background: linear-gradient(135deg, #2c5282, #1a365d); }
  th:nth-child(2) { background: linear-gradient(135deg, #2c5282, #1a365d); }
  th:nth-child(3) { background: linear-gradient(135deg, #38a169, #2f855a); }
  th:nth-child(4) { background: linear-gradient(135deg, #e53e3e, #c53030); }
  td { padding: 4px; border-bottom: 1px solid #f7fafc; font-size: 0.65rem; }
  td:nth-child(3) { background-color: rgba(56, 161, 105, 0.1); color: #2f855a; font-weight: 500; }
  td:nth-child(4) { background-color: rgba(229, 62, 62, 0.1); color: #c53030; font-weight: 500; }
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
</html>`;
};

/**
 * Generate combined HTML report with navigation and resume
 */
export const generateCombinedHTML = (cmh, filesData) => {
  const cmhName = cmhConfigs[cmh]?.name || cmh;
  const combinedGeneratedDate = new Date().toLocaleDateString('en-GB');
  
  // Calculate resume data for each file
  const resumeData = filesData.map((file, fileIndex) => {
    const seedsValues = parseInput(file.seedsInput);
    const activeValues = parseInput(file.activeInput);
    
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

    const activePercentage = totalSeeds > 0 ? Math.round((totalActive / totalSeeds) * 100) : 0;
    const blockedPercentage = totalSeeds > 0 ? Math.round((totalBlocked / totalSeeds) * 100) : 0;

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

  // Calculate grid columns based on number of reports
  const gridColumns = resumeData.length <= 2 ? '1fr 1fr' : 
                     resumeData.length === 3 ? '1fr 1fr 1fr' : 
                     '1fr 1fr 1fr 1fr';

  const styles = `
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
  
  /* Navigation Header */
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
  
  /* Tab Navigation */
  .tab-nav { 
    display: flex; 
    gap: 8px; 
    margin-bottom: 12px;
    background: white;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    overflow-x: auto;
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
    white-space: nowrap;
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
  
  /* Main Container - FIXED HEIGHT */
  .main-container { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 12px; 
    height: calc(100vh - 150px); 
    max-height: calc(100vh - 150px); 
    min-height: calc(100vh - 150px);
  }
  
  /* Resume Grid - FIXED HEIGHT */
  .resume-grid {
    display: grid;
    grid-template-columns: ${gridColumns};
    gap: 12px;
    height: 100%;
    grid-column: 1 / -1;
    min-height: 0;
    overflow: auto;
  }
  
  /* Resume Card - FIXED HEIGHT */
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
  
  /* Individual Report Pages - FIXED HEIGHT */
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
  
  /* Left Panel - CENTERED CONTENT */
  .left-panel { 
    display: flex; 
    flex-direction: column; 
    gap: 12px; 
    grid-row: 2;
    grid-column: 1;
    min-height: 0;
  }
  
  /* Header */
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
  
  /* Stats Panel */
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
  
  /* Diagram Container - CENTERED CONTENT */
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
  
  /* CENTERED CHART CONTAINER */
  .chart-container { 
    position: relative; 
    width: 160px; 
    height: 160px; 
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* ENHANCED PIE CHART ANIMATION */
  .pie-chart { 
    width: 100%; 
    height: 100%; 
    position: relative; 
    border-radius: 50%; 
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
  
  /* CENTERED DIAGRAM LEGEND */
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
  
  /* TABLE CONTAINER - CENTERED CONTENT */
  .table-container{
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

  /* CENTERED TABLE */
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
  
  /* Fixed footer for combined page */
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

  /* Footer */
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
  
  /* View Details Button */
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
`;

  const resumeCardsHTML = resumeData.map(data => `
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
        <button class="view-details-btn" onclick="window.viewReport(${data.fileIndex})">
          View Detailed Report
        </button>
      </div>
    </div>
  `).join('');

  const reportPagesHTML = filesData.map((file, index) => {
    const seedsValues = parseInput(file.seedsInput);
    const activeValues = parseInput(file.activeInput);
    
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

    const activePercentage = totalSeeds > 0 ? Math.round((totalActive / totalSeeds) * 100) : 0;
    const blockedPercentage = totalSeeds > 0 ? Math.round((totalBlocked / totalSeeds) * 100) : 0;

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
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cmhName} - Combined Consumption Reports</title>
<style>${styles}</style>
</head>
<body>
  <div class="nav-header">
    <div class="cmh-badge">${cmhName}</div>
    <div class="nav-controls">
      <button class="nav-btn" onclick="window.prevReport()" id="prevBtn">← Previous</button>
      <span class="current-report" id="currentReport">Resume Overview</span>
      <button class="nav-btn" onclick="window.nextReport()" id="nextBtn">Next →</button>
    </div>
  </div>
  
  <div class="tab-nav">
    <button class="tab-btn active" onclick="window.showTab('resume')">📊 Resume Overview</button>
    ${filesData.map((file, index) => `
      <button class="tab-btn" onclick="window.showTab('report${index}')">${file.title}</button>
    `).join('')}
  </div>

  <div class="main-container">
    <!-- Resume Page -->
    <div id="resume" class="report-page active">
      <div class="resume-grid">
        ${resumeCardsHTML}
      </div>
    </div>
    
    <!-- Individual Report Pages -->
    ${reportPagesHTML}
  </div>

  <script>
    window.currentTab = 'resume';
    const tabs = ['resume', ${filesData.map((_, index) => `'report${index}'`).join(', ')}];
    const reportTitles = ${JSON.stringify(filesData.map(f => f.title))};
    
    window.showTab = function(tabName) {
      document.querySelectorAll('.report-page').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      document.getElementById(tabName).classList.add('active');
      const btnSelector = document.querySelector(\`button[onclick="window.showTab('\${tabName}')"]\`);
      if (btnSelector) btnSelector.classList.add('active');
      
      window.currentTab = tabName;
      window.updateNavigation();
    }
    
    window.nextReport = function() {
      const currentIndex = tabs.indexOf(window.currentTab);
      if (currentIndex < tabs.length - 1) {
        window.showTab(tabs[currentIndex + 1]);
      }
    }
    
    window.prevReport = function() {
      const currentIndex = tabs.indexOf(window.currentTab);
      if (currentIndex > 0) {
        window.showTab(tabs[currentIndex - 1]);
      }
    }

    window.viewReport = function(index) {
      window.showTab('report' + index);
    }
    
    window.updateNavigation = function() {
      const currentIndex = tabs.indexOf(window.currentTab);
      document.getElementById('prevBtn').disabled = currentIndex === 0;
      document.getElementById('nextBtn').disabled = currentIndex === tabs.length - 1;
      
      if (window.currentTab === 'resume') {
        document.getElementById('currentReport').textContent = 'Resume Overview';
      } else {
        const reportIndex = parseInt(window.currentTab.replace('report', ''));
        document.getElementById('currentReport').textContent = reportTitles[reportIndex];
      }
    }
    
    window.updateNavigation();
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        window.prevReport();
      } else if (e.key === 'ArrowRight') {
        window.nextReport();
      }
    });
  </script>
  <div class="fixed-footer">Generated by CMHW TEAM ON ${combinedGeneratedDate}</div>
</body>
</html>`;
};
