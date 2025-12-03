import React, { useState } from 'react';
import './PlanGenerator.css';

const PlanGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [dropsCount, setDropsCount] = useState(24);
  const [generatedPlanRows, setGeneratedPlanRows] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  // State for parsed data
  const [steps, setSteps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [limits, setLimits] = useState([]);
  const [pausedIntervals, setPausedIntervals] = useState([]);
  const [allGeneratedIntervals, setAllGeneratedIntervals] = useState([]);

  const showMessage = (message, type = 'info') => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage('');
      setStatusType('');
    }, 4000);
  };

  // FIXED: Proper parsing function that matches Python logic
  const parsePlan = (planText) => {
    try {
      const lines = planText
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length < 4) {
        throw new Error('Plan must have at least 4 lines: steps, sessions, intervals, limits');
      }

      // Parse steps (line 1)
      let parsedSteps;
      try {
        const stepsLine = lines[0];
        parsedSteps = stepsLine.split('\t').map(step => {
          const val = parseInt(step.trim());
          if (isNaN(val)) throw new Error(`Invalid number: ${step}`);
          return val;
        });
      } catch (e) {
        throw new Error(`Invalid steps format: ${e.message}`);
      }

      // Parse sessions (line 2)
      const sessionsLine = lines[1];
      const parsedSessions = sessionsLine.split('\t').map(session => session.trim());

      if (parsedSteps.length !== parsedSessions.length) {
        throw new Error(
          `Steps count (${parsedSteps.length}) doesn't match sessions count (${parsedSessions.length})`
        );
      }

      // Find limits line (search from bottom up for a line with all integers)
      let limitsIndex = -1;
      for (let i = lines.length - 1; i > 1; i--) {
        try {
          const parts = lines[i].split('\t');
          if (parts.length !== parsedSessions.length) {
            continue;
          }

          const testLimits = [];
          let isValid = true;
          
          for (const part of parts) {
            const trimmed = part.trim();
            if (trimmed) {
              const val = parseInt(trimmed);
              if (isNaN(val)) {
                isValid = false;
                break;
              }
              testLimits.push(val);
            } else {
              // Empty cells are allowed (treated as 0 later)
            }
          }
          
          // Check if we have valid integers for all sessions
          if (isValid) {
            // Count non-empty cells
            const nonEmptyCount = parts.filter(p => p.trim()).length;
            if (nonEmptyCount === parsedSessions.length) {
              limitsIndex = i;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (limitsIndex === -1) {
        throw new Error('Could not find valid limits line');
      }

      // Parse limits
      const parsedLimits = [];
      const limitsLine = lines[limitsIndex];
      for (const part of limitsLine.split('\t')) {
        if (part.trim()) {
          const val = parseInt(part.trim());
          parsedLimits.push(isNaN(val) ? 0 : val);
        } else {
          parsedLimits.push(0);
        }
      }

      // Parse historical intervals (lines 2 to limitsIndex-1)
      const parsedAllGeneratedIntervals = Array(parsedSessions.length)
        .fill()
        .map(() => []);

      for (let lineIdx = 2; lineIdx < limitsIndex; lineIdx++) {
        const parts = lines[lineIdx].split('\t');
        if (parts.length !== parsedSessions.length) {
          continue;
        }

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (part && part.includes('-')) {
            try {
              const [start, end] = part.split('-').map(x => parseInt(x.trim()));
              if (!isNaN(start) && !isNaN(end)) {
                parsedAllGeneratedIntervals[i].push([start, end]);
              }
            } catch (e) {
              // Silently skip invalid intervals
              continue;
            }
          }
        }
      }

      // Parse paused intervals (all lines after limits)
      const parsedPausedIntervals = Array(parsedSessions.length)
        .fill()
        .map(() => []);

      for (let lineIdx = limitsIndex + 1; lineIdx < lines.length; lineIdx++) {
        let parts = lines[lineIdx].split('\t');

        // Pad with empty strings if needed (not 'x')
        while (parts.length < parsedSessions.length) {
          parts.push('');
        }

        for (let i = 0; i < parsedSessions.length; i++) {
          let part = i < parts.length ? parts[i] : '';
          part = part.trim();

          if (part && part.toLowerCase() !== 'x') {
            try {
              const partClean = part.replace(/\s+/g, '');
              if (partClean.includes('-')) {
                const [start, end] = partClean.split('-').map(x => parseInt(x));
                if (isNaN(start) || isNaN(end)) {
                  throw new Error(`Invalid numbers in: ${partClean}`);
                }
                if (start > end) {
                  throw new Error(`Paused interval start > end: ${start}-${end}`);
                }
                parsedPausedIntervals[i].push([start, end]);
              } else {
                const val = parseInt(partClean);
                if (isNaN(val)) {
                  throw new Error(`Invalid number: ${partClean}`);
                }
                parsedPausedIntervals[i].push([val, val]);
              }
            } catch (e) {
              throw new Error(`Invalid paused interval format '${part}': ${e.message}`);
            }
          }
        }
      }

      return {
        steps: parsedSteps,
        sessions: parsedSessions,
        limits: parsedLimits,
        pausedIntervals: parsedPausedIntervals,
        allGeneratedIntervals: parsedAllGeneratedIntervals,
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  // FIXED: Updated helper functions to match Python logic exactly
  const isIntervalOverlapping = (start, end, intervals) => {
    for (const [intervalStart, intervalEnd] of intervals) {
      if (start <= intervalEnd && intervalStart <= end) {
        return true;
      }
    }
    return false;
  };

  const isIntervalInPast = (start, end, sessionIdx) => {
    for (const [histStart, histEnd] of allGeneratedIntervals[sessionIdx]) {
      // Check if proposed interval is entirely within a historical interval
      if (histStart <= start && end <= histEnd) {
        return true;
      }
    }
    return false;
  };

  const isIntervalInPaused = (start, end, sessionIdx) => {
    return isIntervalOverlapping(start, end, pausedIntervals[sessionIdx]);
  };

  // FIXED: This function had logic issues
  const findNextValidStart = (currentStart, sessionIdx) => {
    const limit = limits[sessionIdx];
    const pausedList = pausedIntervals[sessionIdx];

    if (!pausedList || pausedList.length === 0) {
      // No paused intervals, just check if currentStart exceeds limit
      return currentStart > limit ? 1 : currentStart;
    }

    // Sort paused intervals for efficient processing
    const sortedPaused = [...pausedList].sort((a, b) => a[0] - b[0]);

    let start = currentStart;
    let changed = true;

    while (changed) {
      changed = false;
      for (const [pausedStart, pausedEnd] of sortedPaused) {
        if (pausedStart <= start && start <= pausedEnd) {
          // Current start is within a paused interval, move to after it
          start = pausedEnd + 1;
          changed = true;
          
          // Check if the new start is beyond the limit
          if (start > limit) {
            start = 1;
            // Check again if the reset start (1) is in a paused interval
            // This handles cases like paused 1-50, limit 320
            for (const [ps, pe] of sortedPaused) {
              if (ps <= start && start <= pe) {
                start = pe + 1;
                if (start > limit) {
                  start = 1;
                }
                break;
              }
            }
          }
          break; // Restart the loop to check the new start against all pauses
        }
      }
    }

    return start;
  };

  const getNextStartPosition = (sessionIdx) => {
    if (!allGeneratedIntervals[sessionIdx] || allGeneratedIntervals[sessionIdx].length === 0) {
      return 1;
    }

    // Get the last interval from historical data
    const lastInterval = allGeneratedIntervals[sessionIdx][allGeneratedIntervals[sessionIdx].length - 1];
    const lastEnd = lastInterval[1];
    const limit = limits[sessionIdx];

    let start;
    if (lastEnd >= limit) {
      // If last interval ended at or beyond limit, restart from 1
      start = 1;
    } else {
      // Otherwise continue from next position
      start = lastEnd + 1;
    }

    // Ensure the start position is not in a paused interval
    return findNextValidStart(start, sessionIdx);
  };

  // FIXED: This function had issues with limit handling
  const generateSingleInterval = (start, step, sessionIdx) => {
    const limit = limits[sessionIdx];

    // First, ensure the starting position is valid (not in pause, not beyond limit)
    const currentStart = findNextValidStart(start, sessionIdx);

    // Calculate the proposed end value
    const proposedEnd = currentStart + step - 1;

    // Check if the proposed interval hits the limit
    if (proposedEnd > limit) {
      // The interval would exceed the limit
      if (currentStart <= limit) {
        // Create an interval that ends exactly at the limit
        const limitedEnd = limit;
        const intervalStr = `${currentStart}-${limitedEnd}`;

        // Calculate the next start position after hitting the limit
        let nextStart = 1; // Restart from 1 after hitting limit
        nextStart = findNextValidStart(nextStart, sessionIdx); // Skip any pauses at 1

        return ["Limite", nextStart];
      } else {
        // This case shouldn't normally happen if findNextValidStart works correctly,
        // but if start > limit, we return Limite and set nextStart to 1 (skipping pauses)
        const nextStart = findNextValidStart(1, sessionIdx);
        return ["Limite", nextStart];
      }
    }

    // Check if the proposed interval overlaps with a paused interval
    if (isIntervalInPaused(currentStart, proposedEnd, sessionIdx)) {
      // The interval is within a paused range
      // Find the start position after this pause
      let nextStart = proposedEnd + 1; // Start after the current attempt
      nextStart = findNextValidStart(nextStart, sessionIdx); // Skip any pauses

      // Return 'pause' marker and the calculated next start
      return ["pause", nextStart];
    }

    // Check if the proposed interval already exists in history
    if (isIntervalInPast(currentStart, proposedEnd, sessionIdx)) {
      // The interval exists, try the next possible one
      let nextStart = proposedEnd + 1;
      // Ensure the next start is valid
      nextStart = findNextValidStart(nextStart, sessionIdx);

      // Return 'X' for this drop and the calculated next start
      return ["X", nextStart];
    }

    // If all checks pass, return the valid interval
    const intervalStr = `${currentStart}-${proposedEnd}`;
    let nextStart = proposedEnd + 1;
    // Ensure the next start is valid
    nextStart = findNextValidStart(nextStart, sessionIdx);

    return [intervalStr, nextStart];
  };

  const generatePlan = (numDrops) => {
    try {
      // Initialize starting positions for each session
      const currentPositions = sessions.map((_, i) => getNextStartPosition(i));

      const newPlan = [];

      for (let drop = 0; drop < numDrops; drop++) {
        const rowIntervals = [];

        for (let sessionIdx = 0; sessionIdx < sessions.length; sessionIdx++) {
          const currentPos = currentPositions[sessionIdx];
          const step = steps[sessionIdx];

          const [intervalStr, nextStart] = generateSingleInterval(currentPos, step, sessionIdx);

          rowIntervals.push(intervalStr);
          currentPositions[sessionIdx] = nextStart;
        }

        newPlan.push(rowIntervals.join('\t'));
      }

      return newPlan;
    } catch (error) {
      showMessage(`Generation Error: ${error.message}`, 'error');
      return null;
    }
  };

  const handleGeneratePlan = () => {
    if (!inputText.trim()) {
      showMessage('Please paste a plan into the text area.', 'warning');
      return;
    }

    // Parse the input plan
    const result = parsePlan(inputText);
    if (!result.success) {
      showMessage(`Parsing Error: ${result.error}`, 'error');
      return;
    }

    // Validate drops count
    if (dropsCount <= 0) {
      showMessage('Number of drops must be positive.', 'error');
      return;
    }

    // Update state with parsed data
    setSteps(result.steps);
    setSessions(result.sessions);
    setLimits(result.limits);
    setPausedIntervals(result.pausedIntervals);
    setAllGeneratedIntervals(result.allGeneratedIntervals);

    // Generate new plan
    const generatedPlan = generatePlan(dropsCount);

    if (generatedPlan) {
      setGeneratedPlanRows(generatedPlan);
      setOutputText(generatedPlan.join('\n'));
      showMessage(`Generated ${dropsCount} drops successfully!`, 'success');
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedPlanRows) {
      navigator.clipboard.writeText(outputText).then(() => {
        showMessage('Plan copied to clipboard!', 'success');
      }).catch(err => {
        showMessage(`Failed to copy: ${err.message}`, 'error');
      });
    } else {
      showMessage('No plan to copy.', 'warning');
    }
  };

  return (
    <div className="plan-generator">
      <div className="instructions">
        <p>
          Paste your 'Yesterday's plan + steps + sessions names + intervals + limits + paused intervals.'
        </p>
      </div>

      <div className="input-section">
        <label htmlFor="planInput">Paste Your Plan Here:</label>
        <textarea
          id="planInput"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your plan here (tab-separated values)..."
          rows="12"
          cols="80"
        />
      </div>

      <div className="controls">
        <div className="drops-control">
          <label htmlFor="dropsInput">
            Number of Drops:
          </label>
          <input
            id="dropsInput"
            type="number"
            min="1"
            max="1000"
            value={dropsCount}
            onChange={(e) => setDropsCount(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        <button onClick={handleGeneratePlan} className="btn btn-primary">
          Generate New Plan
        </button>

        <button
          onClick={handleCopyToClipboard}
          className="btn btn-secondary"
          disabled={!generatedPlanRows}
        >
          Copy to Clipboard
        </button>
      </div>

      {statusMessage && (
        <div className={`status-message ${statusType}`}>
          {statusMessage}
        </div>
      )}

      <div className="output-section">
        <label htmlFor="planOutput">Generated New Plan:</label>
        <textarea
          id="planOutput"
          value={outputText}
          readOnly
          placeholder="Generated plan will appear here..."
          rows="12"
          cols="80"
        />
      </div>
    </div>
  );
};

export default PlanGenerator;