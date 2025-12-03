/**
 * HTML generation utilities for consumption reports
 * Enhanced with improved visibility, spacing, and animations
 */

export const cmhConfigs = {
  cmh1: {
    BOT_TOKEN: "8121555522:AAFrzbsR7u3R69o2ZwSc2MjpjANIfZaXyfg",
    CHAT_ID: "-1002425470558",
    name: "CMH 1",
    color: "#3B82F6"
  },
  cmh2: {
    BOT_TOKEN: "7784467036:AAGwdwQ0hYsZbmnZy3XqYpQAyHYebxtxoxA",
    CHAT_ID: "-1002458231848",
    name: "CMH 2",
    color: "#10B981"
  },
  cmh3: {
    BOT_TOKEN: "7649122558:AAE1i0IHdHvkbzZ-eE96lnSmX5MYUhQO_AY",
    CHAT_ID: "-1002497192321",
    name: "CMH 3",
    color: "#8B5CF6"
  },
  cmh5: {
    BOT_TOKEN: "7813055110:AAFSRItx1hI7AqXpsxaH8ri6o9a_M_j7df0",
    CHAT_ID: "-4592925120",
    name: "CMH 5",
    color: "#EC4899"
  },
  cmh6: {
    BOT_TOKEN: "8057870747:AAHDOyy87W3Giucy2vP1rYinQHQFAmS2mSQ",
    CHAT_ID: "-1002391979095",
    name: "CMH 6",
    color: "#F59E0B"
  },
  cmh8: {
    BOT_TOKEN: "7097067993:AAGoXpExWDs7ccveqOsfoW8fsbzmXaJWT2M",
    CHAT_ID: "-1002273044099",
    name: "CMH 8",
    color: "#06B6D4"
  },
  cmh9: {
    BOT_TOKEN: "7111890715:AAEWMWHQaF7jhvpV7QQBTXOc6KbAg1bWQCs",
    CHAT_ID: "-1002438857483",
    name: "CMH 9",
    color: "#14B8A6"
  },
  cmh12: {
    BOT_TOKEN: "7798410444:AAE5jRUbMcXQ-ndZp8OUq14Vc27LeR_0BNQ",
    CHAT_ID: "-1002490055319",
    name: "CMH 12",
    color: "#8B5CF6"
  },
  cmh16: {
    BOT_TOKEN: "8253193081:AAF2o9R62TFks3D_d3zrUpcZa473M36ZDrs",
    CHAT_ID: "-1002948726953",
    name: "CMH 16",
    color: "#6366F1"
  }
};

/**
 * Parse newline-separated input string into array of numbers
 */
export const parseInput = (input) => {
  return input
    .split('\n')
    .map(value => value.trim())
    .filter(value => value !== '');
};

/**
 * Calculate totals from seeds and active values
 */
export const calculateTotals = (seedsInput, activeInput) => {
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

  return { totalSeeds, totalActive, totalBlocked };
};

/**
 * Generate table data from inputs
 */
export const generateTableData = (seedsInput, activeInput, sessionsOutInput) => {
  const seedsValues = parseInput(seedsInput);
  const activeValues = parseInput(activeInput);
  
  const { totalSeeds, totalActive, totalBlocked } = calculateTotals(seedsInput, activeInput);
  
  const tableData = seedsValues.map((seeds, i) => {
    const seedsNum = parseInt(seeds) || 0;
    const activeNum = parseInt(activeValues[i]) || 0;
    const blockedNum = seedsNum - activeNum;
    
    return {
      dropNumber: i + 1,
      seeds: seedsNum,
      active: activeNum,
      blocked: blockedNum
    };
  });

  return {
    tableData,
    totals: { seeds: totalSeeds, active: totalActive, blocked: totalBlocked }
  };
};

/**
 * Generate individual report HTML content - IMPROVED VISIBILITY & SPACING
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
  const cmhColor = cmhConfigs[cmh]?.color || "#3B82F6";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${cmhName} - ${title} - Consumption Report</title>
<style>
  * { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
  }
  
  body { 
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; 
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
    color: #374151; 
    line-height: 1.4; 
    padding: 8px; 
    font-size: 11px; 
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.8s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .container { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 16px; 
    flex: 1;
    margin-bottom: 20px;
  }
  
  .header { 
    grid-column: 1 / -1; 
    text-align: center; 
    margin-bottom: 16px; 
    padding: 16px; 
    background: white; 
    border-radius: 12px; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
    border: 1px solid #e5e7eb;
    animation: slideDown 0.6s ease-out;
    position: relative;
    overflow: hidden;
  }
  
  .header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${cmhColor}, #059669);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: 200px 0; }
  }
  
  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .cmh-badge { 
    background: linear-gradient(135deg, ${cmhColor}, #1d4ed8); 
    color: white; 
    padding: 6px 16px; 
    border-radius: 6px; 
    font-size: 0.7rem; 
    margin-bottom: 8px; 
    display: inline-block; 
    font-weight: 600; 
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3); }
    50% { box-shadow: 0 2px 16px rgba(37, 99, 235, 0.5); }
    100% { box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3); }
  }
  
  .title { 
    font-size: 1.3rem; 
    font-weight: 700; 
    background: linear-gradient(135deg, ${cmhColor}, #059669); 
    -webkit-background-clip: text; 
    background-clip: text; 
    color: transparent; 
    margin-bottom: 6px; 
    position: relative;
    display: inline-block;
  }
  
  .title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, ${cmhColor}, #059669);
    transform: scaleX(0);
    transform-origin: left;
    animation: expandLine 1s ease-out 0.5s forwards;
  }
  
  @keyframes expandLine {
    to { transform: scaleX(1); }
  }
  
  .subtitle { 
    color: #6b7280; 
    font-size: 0.7rem; 
  }
  
  .left-panel { 
    display: flex; 
    flex-direction: column; 
    gap: 16px; 
  }
  
  .stats-panel { 
    background: white; 
    border-radius: 12px; 
    padding: 16px; 
    border: 1px solid #e5e7eb; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
    animation: slideInLeft 0.6s ease-out 0.2s both;
  }
  
  @keyframes slideInLeft {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .stat-item { 
    margin-bottom: 10px; 
    padding: 8px 0; 
    border-bottom: 1px solid #f3f4f6; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    transition: all 0.3s ease;
  }
  
  .stat-item:hover {
    transform: translateX(5px);
    background-color: #f8fafc;
    border-radius: 6px;
    padding-left: 10px;
    padding-right: 10px;
  }
  
  .stat-value { 
    font-weight: 700; 
    color: ${cmhColor}; 
    font-size: 0.9rem; 
    position: relative;
  }
  
  .stat-value::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${cmhColor};
    transition: width 0.3s ease;
  }
  
  .stat-item:hover .stat-value::after {
    width: 100%;
  }
  
  .diagram-container { 
    background: white; 
    border-radius: 12px; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
    padding: 16px; 
    border: 1px solid #e5e7eb; 
    flex-grow: 1; 
    display: flex; 
    flex-direction: column; 
    align-items: center;
    animation: slideInLeft 0.6s ease-out 0.4s both;
  }
  
  .diagram-title { 
    font-size: 0.85rem; 
    font-weight: 600; 
    margin-bottom: 12px; 
    color: #374151; 
    text-align: center; 
  }
  
  .chart-container { 
    position: relative; 
    width: 160px; 
    height: 160px; 
    margin: 0 auto 16px; 
  }
  
  .pie-chart { 
    width: 100%; 
    height: 100%; 
    position: relative; 
    border-radius: 50%; 
    background: conic-gradient( 
      #059669 0% ${activePercentage}%, 
      #dc2626 ${activePercentage}% 100% 
    ); 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
    animation: rotate 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); 
    transform-origin: center; 
  }
  
  @keyframes rotate {
    0% { transform: scale(0.8) rotate(-90deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
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
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.1); 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    z-index: 10; 
    border: 1px solid #e5e7eb; 
    animation: popIn 0.5s ease-out 1s both;
  }
  
  @keyframes popIn {
    0% { transform: translate(-50%, -50%) scale(0); }
    80% { transform: translate(-50%, -50%) scale(1.1); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
  
  .total-count { 
    font-size: 0.9rem; 
    font-weight: 700; 
    color: ${cmhColor}; 
    line-height: 1; 
  }
  
  .total-label { 
    font-size: 0.6rem; 
    color: #6b7280; 
    margin-top: 2px; 
  }
  
  .diagram-legend { 
    width: 100%;
    max-width: 200px;
  }
  
  .legend-item { 
    display: flex; 
    align-items: center; 
    margin-bottom: 8px; 
    padding: 8px; 
    border-radius: 6px; 
    background: #f8fafc; 
    border: 1px solid #e5e7eb; 
    transition: all 0.3s ease; 
    animation: fadeInUp 0.5s ease-out 1.2s both;
  }
  
  .legend-item:nth-child(2) {
    animation-delay: 1.4s;
  }
  
  @keyframes fadeInUp {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .legend-item:hover { 
    transform: translateX(4px); 
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .legend-color { 
    width: 12px; 
    height: 12px; 
    border-radius: 50%; 
    margin-right: 8px; 
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); 
  }
  
  .legend-label { 
    flex: 1; 
    font-size: 0.7rem; 
    font-weight: 500; 
  }
  
  .legend-percentage { 
    font-weight: 700; 
    color: ${cmhColor}; 
    margin-left: 4px; 
    font-size: 0.7rem; 
  }
  
  .legend-count { 
    font-size: 0.65rem; 
    color: #6b7280; 
    margin-left: 4px; 
  }
  
  .table-container { 
    background: white; 
    border-radius: 12px; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
    padding: 16px; 
    border: 1px solid #e5e7eb; 
    overflow: hidden; 
    height: 100%; 
    display: flex;
    flex-direction: column;
    animation: slideInRight 0.6s ease-out 0.6s both;
  }
  
  @keyframes slideInRight {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .table-wrapper {
    flex: 1;
    overflow: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  table { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 9px; 
  }
  
  th { 
    padding: 10px 8px; 
    text-align: left; 
    border-bottom: 2px solid #e5e7eb; 
    font-weight: 600; 
    color: white; 
    font-size: 0.7rem; 
    position: sticky; 
    top: 0; 
    transition: all 0.3s ease;
  }
  
  th:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
  
  th:nth-child(1) { background: linear-gradient(135deg, ${cmhColor}, #1d4ed8); }
  th:nth-child(2) { background: linear-gradient(135deg, ${cmhColor}, #1d4ed8); }
  th:nth-child(3) { background: linear-gradient(135deg, #059669, #047857); }
  th:nth-child(4) { background: linear-gradient(135deg, #dc2626, #b91c1c); }
  
  td { 
    padding: 8px 6px; 
    border-bottom: 1px solid #f3f4f6; 
    font-size: 0.65rem; 
    transition: all 0.2s ease;
  }
  
  tr:hover td {
    background-color: #f8fafc;
    transform: scale(1.01);
  }
  
  td:nth-child(3) { 
    background-color: rgba(5, 150, 105, 0.05); 
    color: #047857; 
    font-weight: 500; 
  }
  
  td:nth-child(4) { 
    background-color: rgba(220, 38, 38, 0.05); 
    color: #b91c1c; 
    font-weight: 500; 
  }
  
  .totals-row { 
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(5, 150, 105, 0.05)); 
    font-weight: 600; 
    position: sticky; 
    bottom: 0; 
    animation: highlight 2s ease-out;
  }
  
  @keyframes highlight {
    0% { background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(5, 150, 105, 0.2)); }
    100% { background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(5, 150, 105, 0.05)); }
  }
  
  .totals-row td { 
    border-top: 2px solid #e5e7eb; 
    padding: 10px 6px; 
  }
  
  footer { 
    text-align: center; 
    padding: 12px; 
    color: #6b7280; 
    border-top: 1px solid #e5e7eb; 
    font-size: 0.65rem; 
    background: white; 
    border-radius: 6px; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    animation: fadeIn 1s ease-out 1.6s both;
    margin-top: auto;
  }
  
  /* Floating particles background */
  .particles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
  }
  
  .particle {
    position: absolute;
    background: rgba(37, 99, 235, 0.1);
    border-radius: 50%;
    animation: float 15s infinite linear;
  }
  
  @keyframes float {
    0% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-20px) translateX(10px); }
    50% { transform: translateY(0) translateX(20px); }
    75% { transform: translateY(20px) translateX(10px); }
    100% { transform: translateY(0) translateX(0); }
  }
</style>
</head>
<body class="with-footer">
  <!-- Floating particles -->
  <div class="particles" id="particles"></div>
  
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
            <div class="legend-color" style="background-color: #059669;"></div>
            <span class="legend-label">Active Seeds</span>
            <span class="legend-percentage">${activePercentage}%</span>
            <span class="legend-count">(${totalActive})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #dc2626;"></div>
            <span class="legend-label">Blocked Seeds</span>
            <span class="legend-percentage">${blockedPercentage}%</span>
            <span class="legend-count">(${totalBlocked})</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <h3 style="margin-bottom: 12px; color: #374151;">Detailed Data</h3>
      <div class="table-wrapper">
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
              const delay = i * 0.05;
              return `
                <tr style="animation: fadeInUp 0.5s ease-out ${delay}s both">
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
    </div>
  </div>
  
  <footer><p>CMHW - ${cmhName} | Generated on ${new Date().toLocaleDateString('en-GB')}</p></footer>

  <script>
    // Create floating particles
    function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 15;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size and position
        const size = Math.random() * 60 + 10;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 15;
        
        particle.style.width = \`\${size}px\`;
        particle.style.height = \`\${size}px\`;
        particle.style.left = \`\${left}%\`;
        particle.style.top = \`\${top}%\`;
        particle.style.animationDelay = \`\${delay}s\`;
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        
        particlesContainer.appendChild(particle);
      }
    }
    
    // Initialize particles when page loads
    document.addEventListener('DOMContentLoaded', createParticles);
    
    // Add hover effect to table rows
    document.addEventListener('DOMContentLoaded', function() {
      const tableRows = document.querySelectorAll('tbody tr');
      tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
          this.style.transform = 'scale(1.01)';
          this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        });
        
        row.addEventListener('mouseleave', function() {
          this.style.transform = 'scale(1)';
          this.style.boxShadow = 'none';
        });
      });
    });
  </script>
</body>
</html>`;
};

/**
 * Generate combined HTML report with improved visibility and spacing
 */
export const generateCombinedHTML = (cmh, filesData) => {
  const cmhName = cmhConfigs[cmh]?.name || cmh;
  const cmhColor = cmhConfigs[cmh]?.color || "#3B82F6";
  const currentDate = new Date().toLocaleDateString('en-GB');
  const currentHour = new Date().getHours().toString().padStart(2, '0');
  
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

  const totalBlocked = resumeData.reduce((sum, data) => sum + data.totalBlocked, 0);
  const totalActive = resumeData.reduce((sum, data) => sum + data.totalActive, 0);
  const totalSeeds = resumeData.reduce((sum, data) => sum + data.totalSeeds, 0);
  const avgBlockRate = resumeData.length > 0 ? Math.round(resumeData.reduce((sum, data) => sum + data.blockedPercentage, 0) / resumeData.length) : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Consumption Dashboard - ${cmhName}</title>

    <!-- Tailwind -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'cmh-primary': '${cmhColor}',
                        'inbox-green': {
                            light: '#d1fae5',
                            DEFAULT: '#059669',
                            dark: '#047857'
                        },
                        'spam-red': {
                            light: '#fecaca',
                            DEFAULT: '#dc2626',
                            dark: '#b91c1c'
                        },
                        'border-light': '#e5e7eb'
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.5s ease-in-out',
                        'slide-up': 'slideUp 0.5s ease-out',
                        'pulse-slow': 'pulse 3s infinite',
                        'bounce-gentle': 'bounceGentle 2s infinite',
                        'float': 'float 6s ease-in-out infinite',
                        'chart-grow': 'chartGrow 1.5s ease-out',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' }
                        },
                        slideUp: {
                            '0%': { transform: 'translateY(20px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' }
                        },
                        bounceGentle: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-5px)' }
                        },
                        float: {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' }
                        },
                        chartGrow: {
                            '0%': { transform: 'scale(0.8) rotate(-90deg)', opacity: '0' },
                            '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
                        }
                    }
                }
            }
        }
    </script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }

        body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .main-content {
            flex: 1;
            margin-bottom: 2rem;
        }

        .chart-container {
            position: relative;
            height: 12rem !important;
            width: 100% !important;
            min-height: 12rem;
        }
        
        .chart-container canvas {
            width: 100% !important;
            height: 100% !important;
        }
        
        .nav-btn {
            transition: all 0.3s ease;
        }
        
        .nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .content-area {
            display: none;
            animation: fadeIn 0.5s ease-in-out;
        }

        .content-area.active {
            display: block;
        }

        .tab-btn {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .tab-btn::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 3px;
            background: ${cmhColor};
            transition: width 0.3s ease;
        }
        
        .tab-btn.active::after {
            width: 100%;
        }

        .tab-btn.active {
            background: ${cmhColor} !important;
            color: white !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .table-scroll {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .stat-card {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: ${cmhColor};
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover::before {
            transform: scaleX(1);
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .report-card {
            transition: all 0.3s ease;
        }
        
        .report-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }
        
        .floating-shape {
            position: absolute;
            border-radius: 50%;
            opacity: 0.1;
            animation: float 15s infinite linear;
            z-index: -1;
        }
        
        @keyframes float {
            0% { transform: translateY(0) translateX(0) rotate(0deg); }
            33% { transform: translateY(-20px) translateX(10px) rotate(120deg); }
            66% { transform: translateY(10px) translateX(20px) rotate(240deg); }
            100% { transform: translateY(0) translateX(0) rotate(360deg); }
        }
        
        .glow {
            box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
        }
        
        .sidebar-item {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .sidebar-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 0;
            background: ${cmhColor};
            opacity: 0.1;
            transition: width 0.3s ease;
        }
        
        .sidebar-item:hover::before {
            width: 100%;
        }
        
        .sidebar-item:hover {
            transform: translateX(5px);
        }
        
        .progress-bar {
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            background: #e5e7eb;
        }
        
        .progress-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 1s ease-in-out;
        }
        
        .counter {
            font-variant-numeric: tabular-nums;
        }
        
        .stagger-animation > * {
            opacity: 0;
            animation: slideUp 0.5s ease-out forwards;
        }
        
        .stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
        .stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
        .stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
        .stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
        .stagger-animation > *:nth-child(5) { animation-delay: 0.5s; }

        .chart-animation {
            animation: chartGrow 1.5s ease-out;
        }

        .view-report-btn {
            background: ${cmhColor} !important;
            color: white !important;
            border: 2px solid ${cmhColor} !important;
        }

        .view-report-btn:hover {
            background: white !important;
            color: ${cmhColor} !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .report-header {
            background: linear-gradient(135deg, ${cmhColor}, #1e40af) !important;
            color: white !important;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 text-sm min-h-screen relative overflow-x-hidden">
    <!-- Floating background shapes -->
    <div class="floating-shape w-64 h-64 bg-blue-200 top-10 -left-20"></div>
    <div class="floating-shape w-48 h-48 bg-green-200 bottom-20 -right-16" style="animation-delay: -5s;"></div>
    <div class="floating-shape w-32 h-32 bg-purple-200 top-1/3 right-1/4" style="animation-delay: -10s;"></div>

    <!-- Fixed Top Bar - IMPROVED SPACING -->
    <div class="bg-white/90 backdrop-blur-sm px-6 py-4 flex justify-between items-center shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50 animate-slide-up">
        <!-- Left Section -->
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-[${cmhColor}] to-blue-800 rounded-2xl flex items-center justify-center shadow-lg glow animate-bounce-gentle">
                <i class="fas fa-chart-pie text-white text-xl"></i>
            </div>
            <div class="flex flex-col">
                <div class="text-gray-900 font-bold text-xl">Consumption Report Details</div>
                <div class="text-gray-500 text-sm">ACTIVE & BLOCKED SEEDS</div>
            </div>
        </div>

        <!-- Center Section -->
        <div class="flex items-center gap-8">
            <div class="text-center">
                <div class="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Entity</div>
                <div class="text-[${cmhColor}] font-bold text-lg uppercase" id="ENTITY">${cmhName}</div>
            </div>
            <div class="h-8 w-px bg-gray-300"></div>
            <div class="text-center">
                <div class="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Reports</div>
                <div class="text-gray-900 font-bold text-xl counter" id="reportCount">${filesData.length}</div>
            </div>
            <div class="h-8 w-px bg-gray-300"></div>
            <div class="text-center">
                <div class="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Hour</div>
                <div class="text-gray-900 font-bold text-xl">${currentHour}:00</div>
            </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-6">
            <div class="text-center">
                <div class="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Date & Time</div>
                <div class="text-gray-900 font-bold">
                    <span id="current_date">${currentDate}</span> • 
                    <span id="current_hour" class="text-[${cmhColor}]">${currentHour}:00</span>
                </div>
            </div>
        </div>
    </div>

    <div class="flex min-h-screen pt-20"> <!-- Increased padding-top for more space -->
        <!-- Fixed Sidebar - IMPROVED SPACING -->
        <div class="w-64 bg-white/80 backdrop-blur-sm p-6 border-r border-border-light hidden lg:block fixed top-20 left-0 bottom-0 z-40 overflow-y-auto animate-slide-up" style="animation-delay: 0.1s;">
            <div class="mb-8"> <!-- Increased margin-bottom -->
                <div class="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-4">Quick Stats</div> <!-- Increased margin-bottom -->
                <div class="sidebar-item bg-white p-4 rounded-lg mb-4 border-l-4 border-[${cmhColor}] shadow-sm hover:shadow-md"> <!-- Increased margin-bottom -->
                    <div class="text-gray-500 text-xs mb-1">Total Reports :</div>
                    <div class="text-gray-800 font-bold text-xl counter">${filesData.length}</div>
                </div>
                <!-- Blocked Statistics -->
                <div class="sidebar-item bg-white p-4 rounded-lg mb-4 border-l-4 border-red-500 shadow-sm hover:shadow-md"> <!-- Increased margin-bottom -->
                    <div class="text-gray-500 text-xs mb-1">Total Blocked :</div>
                    <div class="text-gray-800 font-bold text-xl counter">${totalBlocked}</div>
                </div>
                <div class="sidebar-item bg-white p-4 rounded-lg mb-4 border-l-4 border-orange-500 shadow-sm hover:shadow-md"> <!-- Increased margin-bottom -->
                    <div class="text-gray-500 text-xs mb-1">Avg Block Rate :</div>
                    <div class="text-gray-800 font-bold text-xl counter">${avgBlockRate}%</div>
                </div>
                <div class="sidebar-item bg-white p-4 rounded-lg mb-4 border-l-4 border-purple-500 shadow-sm hover:shadow-md"> <!-- Increased margin-bottom -->
                    <div class="text-gray-500 text-xs mb-1">Total Seeds :</div>
                    <div class="text-gray-800 font-bold text-xl counter">${totalSeeds}</div>
                </div>
            </div>
            
            <div class="mt-8"> <!-- Added margin-top -->
                <div class="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-4">Report Summary</div> <!-- Increased margin-bottom -->
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200"> <!-- Increased padding -->
                    <div class="text-green-600 text-sm font-semibold mb-3 flex items-center"> <!-- Increased margin-bottom -->
                        <i class="fas fa-check-circle mr-2"></i> Active Seeds: ${totalActive}
                    </div>
                    <div class="text-red-600 text-sm font-semibold flex items-center mb-4"> <!-- Added margin-bottom -->
                        <i class="fas fa-times-circle mr-2"></i> Blocked Seeds: ${totalBlocked}
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="mt-4">
                        <div class="flex justify-between text-xs text-gray-600 mb-2">
                            <span>Active: ${totalActive}</span>
                            <span>Blocked: ${totalBlocked}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill bg-green-500" style="width: ${totalSeeds > 0 ? (totalActive / totalSeeds) * 100 : 0}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content flex-1 bg-transparent p-6 overflow-y-auto lg:ml-64"> <!-- Increased padding -->
            <!-- Navigation Tab Only - IMPROVED -->
            <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-border-light shadow-lg mb-6 animate-slide-up" style="animation-delay: 0.2s;">
                <div class="p-5"> <!-- Increased padding -->
                    <!-- Tab Navigation -->
                    <div class="flex gap-3 mb-8 overflow-x-auto pb-3"> <!-- Increased margins and padding -->
                        <button class="tab-btn bg-[${cmhColor}]/10 text-[${cmhColor}] px-5 py-3 rounded-lg text-sm font-semibold transition-all active" onclick="window.showTab('resume')">
                            <i class="fas fa-chart-pie mr-2"></i>Resume Overview
                        </button>
                        ${filesData.map((file, index) => `
                            <button class="tab-btn bg-gray-100 text-gray-700 px-5 py-3 rounded-lg text-sm font-semibold transition-all" onclick="window.showTab('report${index}')">
                                <i class="fas fa-file-alt mr-2"></i>${file.title}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Resume Overview -->
                    <div id="resume" class="content-area active">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-animation"> <!-- Increased gap -->
                            ${resumeData.map((data, index) => `
                                <div class="report-card bg-white rounded-xl border border-border-light shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300" style="animation-delay: ${0.3 + index * 0.1}s">
                                    <div class="report-header px-5 py-4 font-semibold text-sm flex justify-between items-center"> <!-- Increased padding -->
                                        ${data.title}
                                        <span class="text-xs bg-white/20 px-2 py-1 rounded-full">${data.fileIndex + 1}/${filesData.length}</span>
                                    </div>
                                    <div class="p-5"> <!-- Increased padding -->
                                        <!-- Metric Cards -->
                                        <div class="grid grid-cols-2 gap-4 mb-6"> <!-- Increased gap and margin -->
                                            <div class="stat-card p-4 rounded-lg border shadow-sm text-center bg-green-50 border-green-200"> <!-- Increased padding -->
                                                <div class="text-green-600 font-bold text-xl counter">${data.totalActive}</div>
                                                <div class="text-green-800 text-xs uppercase mt-2">Active Seeds</div> <!-- Increased margin-top -->
                                            </div>
                                            <div class="stat-card p-4 rounded-lg border shadow-sm text-center bg-red-50 border-red-200"> <!-- Increased padding -->
                                                <div class="text-red-600 font-bold text-xl counter">${data.totalBlocked}</div>
                                                <div class="text-red-800 text-xs uppercase mt-2">Blocked Seeds</div> <!-- Increased margin-top -->
                                            </div>
                                        </div>

                                        <!-- Chart -->
                                        <div class="chart-container flex items-center justify-center mb-6"> <!-- Added margin-bottom -->
                                            <div class="relative w-36 h-36"> <!-- Increased size -->
                                                <div class="pie-chart w-full h-full rounded-full shadow-lg chart-animation" style="background: conic-gradient(#059669 0% ${data.activePercentage}%, #dc2626 ${data.activePercentage}% 100%)">
                                                    <div class="absolute inset-0 flex items-center justify-center">
                                                        <div class="bg-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg"> <!-- Increased size -->
                                                            <div class="text-[${cmhColor}] font-bold text-sm counter">${data.totalSeeds}</div>
                                                            <div class="text-gray-500 text-xs">Total</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Legend -->
                                        <div class="flex justify-center gap-5 mb-6"> <!-- Increased gap and margin -->
                                            <div class="flex items-center gap-2">
                                                <div class="w-3 h-3 bg-green-500 rounded-full shadow"></div>
                                                <span class="text-xs text-gray-600">Active (${data.activePercentage}%)</span>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <div class="w-3 h-3 bg-red-500 rounded-full shadow"></div>
                                                <span class="text-xs text-gray-600">Blocked (${data.blockedPercentage}%)</span>
                                            </div>
                                        </div>

                                        <!-- Details -->
                                        <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"> <!-- Increased padding and margin -->
                                            <div class="grid grid-cols-2 gap-3 text-xs"> <!-- Increased gap -->
                                                <div class="text-gray-600">Total Seeds:</div>
                                                <div class="text-gray-900 font-semibold text-right counter">${data.totalSeeds}</div>
                                                <div class="text-gray-600">Sessions Out:</div>
                                                <div class="text-gray-900 font-semibold text-right">${data.sessionsOut}</div>
                                            </div>
                                        </div>

                                        <button class="view-report-btn w-full mt-6 py-3 rounded-lg text-sm font-semibold transition-all nav-btn glow" onclick="window.viewReport(${data.fileIndex})">
                                            <i class="fas fa-external-link-alt mr-2"></i>View Detailed Report
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Individual Reports -->
                    ${filesData.map((file, index) => {
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
                            <div id="report${index}" class="content-area">
                                <div class="bg-white rounded-xl border border-border-light shadow-lg overflow-hidden animate-slide-up">
                                    <div class="report-header px-6 py-5 font-semibold text-sm flex justify-between items-center"> <!-- Increased padding -->
                                        <span>${file.title} - Detailed Consumption Report</span>
                                        <span class="text-xs bg-white/20 px-2 py-1 rounded-full">${index + 1}/${filesData.length}</span>
                                    </div>
                                    <div class="p-6"> <!-- Increased padding -->
                                        <!-- Stats Overview -->
                                        <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8 stagger-animation"> <!-- Increased gap and margin -->
                                            <div class="stat-card p-5 rounded-lg border shadow-sm text-center bg-blue-50 border-blue-200"> <!-- Increased padding -->
                                                <div class="text-blue-600 font-bold text-2xl counter">${totalSeeds}</div>
                                                <div class="text-blue-800 text-xs uppercase mt-2">Total Seeds</div> <!-- Increased margin-top -->
                                            </div>
                                            <div class="stat-card p-5 rounded-lg border shadow-sm text-center bg-green-50 border-green-200"> <!-- Increased padding -->
                                                <div class="text-green-600 font-bold text-2xl counter">${totalActive}</div>
                                                <div class="text-green-800 text-xs uppercase mt-2">Active Seeds</div> <!-- Increased margin-top -->
                                            </div>
                                            <div class="stat-card p-5 rounded-lg border shadow-sm text-center bg-red-50 border-red-200"> <!-- Increased padding -->
                                                <div class="text-red-600 font-bold text-2xl counter">${totalBlocked}</div>
                                                <div class="text-red-800 text-xs uppercase mt-2">Blocked Seeds</div> <!-- Increased margin-top -->
                                            </div>
                                            <div class="stat-card p-5 rounded-lg border shadow-sm text-center bg-purple-50 border-purple-200"> <!-- Increased padding -->
                                                <div class="text-purple-600 font-bold text-2xl">${file.sessionsOutInput}</div>
                                                <div class="text-purple-800 text-xs uppercase mt-2">Sessions Out</div> <!-- Increased margin-top -->
                                            </div>
                                        </div>

                                        <!-- Chart and Table Layout -->
                                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8"> <!-- Increased gap -->
                                            <!-- Chart Section -->
                                            <div class="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col items-center"> <!-- Increased padding and centered -->
                                                <h3 class="text-gray-700 font-semibold mb-6 text-center">Consumption Distribution</h3> <!-- Increased margin -->
                                                <div class="chart-container flex justify-center">
                                                    <div class="relative w-44 h-44"> <!-- Increased size -->
                                                        <div class="pie-chart w-full h-full rounded-full shadow-lg chart-animation" style="background: conic-gradient(#059669 0% ${activePercentage}%, #dc2626 ${activePercentage}% 100%)">
                                                            <div class="absolute inset-0 flex items-center justify-center">
                                                                <div class="bg-white w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg"> <!-- Increased size -->
                                                                    <div class="text-[${cmhColor}] font-bold text-base counter">${totalSeeds}</div>
                                                                    <div class="text-gray-500 text-xs">Total</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="flex justify-center gap-6 mt-6"> <!-- Increased margin -->
                                                    <div class="flex items-center gap-2">
                                                        <div class="w-3 h-3 bg-green-500 rounded-full shadow"></div>
                                                        <span class="text-sm text-gray-600">Active: ${activePercentage}%</span>
                                                    </div>
                                                    <div class="flex items-center gap-2">
                                                        <div class="w-3 h-3 bg-red-500 rounded-full shadow"></div>
                                                        <span class="text-sm text-gray-600">Blocked: ${blockedPercentage}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Table Section -->
                                            <div class="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm"> <!-- Increased padding -->
                                                <h3 class="text-gray-700 font-semibold mb-6 text-center">Detailed Drop Data</h3> <!-- Increased margin -->
                                                <div class="table-scroll">
                                                    <table class="w-full text-xs border-collapse">
                                                        <thead>
                                                            <tr class="bg-[${cmhColor}]/20">
                                                                <th class="text-left p-3 text-[${cmhColor}] border-r rounded-tl-lg">Drop N°</th> <!-- Increased padding -->
                                                                <th class="text-center p-3 text-[${cmhColor}] border-r">Seeds</th> <!-- Increased padding -->
                                                                <th class="text-center p-3 text-[${cmhColor}] border-r">Active</th> <!-- Increased padding -->
                                                                <th class="text-center p-3 text-[${cmhColor}] rounded-tr-lg">Blocked</th> <!-- Increased padding -->
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${seedsValues.map((seeds, i) => {
                                                                const dropNumber = i + 1;
                                                                const active = activeValues[i] || 0;
                                                                const blocked = seeds - active;
                                                                const delay = i * 0.03;
                                                                return `
                                                                    <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors" style="animation: slideUp 0.5s ease-out ${delay}s both">
                                                                        <td class="p-3 font-medium">${dropNumber}</td> <!-- Increased padding -->
                                                                        <td class="p-3 text-center">${seeds}</td> <!-- Increased padding -->
                                                                        <td class="p-3 text-center text-green-600 font-semibold">${active}</td> <!-- Increased padding -->
                                                                        <td class="p-3 text-center text-red-600 font-semibold">${blocked}</td> <!-- Increased padding -->
                                                                    </tr>
                                                                `;
                                                            }).join('')}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr class="bg-gray-100 font-semibold">
                                                                <td class="p-3 rounded-bl-lg">TOTAL</td> <!-- Increased padding -->
                                                                <td class="p-3 text-center counter">${totalSeeds}</td> <!-- Increased padding -->
                                                                <td class="p-3 text-center text-green-600 counter">${totalActive}</td> <!-- Increased padding -->
                                                                <td class="p-3 text-center text-red-600 rounded-br-lg counter">${totalBlocked}</td> <!-- Increased padding -->
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    </div>

    <!-- Footer - POSITIONED AT BOTTOM -->
  <footer class="bg-white/80 backdrop-blur-sm p-4 text-center text-gray-500 text-xs border-t border-border-light rounded-lg shadow animate-fade-in mt-auto">
    <div class="flex items-center justify-center">
      Report generated on ${currentDate} | Created by CMHW Team | 2025 all rights reserved
    </div>
  </footer>

    <script>
        window.currentTab = 'resume';
        const tabs = ['resume', ${filesData.map((_, index) => `'report${index}'`).join(', ')}];
        const reportTitles = ${JSON.stringify(filesData.map(f => f.title))};
        
        // Initialize counters
        function initCounters() {
            const counters = document.querySelectorAll('.counter');
            counters.forEach(counter => {
                const target = parseInt(counter.textContent);
                let current = 0;
                const increment = target / 50;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.ceil(current);
                        setTimeout(updateCounter, 30);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
            });
        }
        
        // Initialize progress bars
        function initProgressBars() {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 500);
            });
        }
        
        window.showTab = function(tabName) {
            document.querySelectorAll('.content-area').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('bg-[${cmhColor}]/10', 'text-[${cmhColor}]');
                btn.classList.add('bg-gray-100', 'text-gray-700');
            });
            
            document.getElementById(tabName).classList.add('active');
            const btnSelector = document.querySelector(\`button[onclick="window.showTab('\${tabName}')"]\`);
            if (btnSelector) {
                btnSelector.classList.add('active', 'bg-[${cmhColor}]/10', 'text-[${cmhColor}]');
                btnSelector.classList.remove('bg-gray-100', 'text-gray-700');
            }
            
            window.currentTab = tabName;
            window.updateNavigation();
            
            // Reinitialize animations for the new tab
            setTimeout(() => {
                initCounters();
                initProgressBars();
            }, 300);
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
            
            if (window.currentTab === 'resume') {
                document.getElementById('currentReport').textContent = 'Resume Overview';
            } else {
                const reportIndex = parseInt(window.currentTab.replace('report', ''));
                document.getElementById('currentReport').textContent = reportTitles[reportIndex];
            }
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            window.updateNavigation();
            initCounters();
            initProgressBars();
            
            // Add keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    window.prevReport();
                } else if (e.key === 'ArrowRight') {
                    window.nextReport();
                }
            });
            
            // Add hover effects to table rows
            const tableRows = document.querySelectorAll('tbody tr');
            tableRows.forEach(row => {
                row.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateX(5px)';
                    this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                });
                
                row.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateX(0)';
                    this.style.boxShadow = 'none';
                });
            });
        });
    </script>
</body>
</html>`;
};