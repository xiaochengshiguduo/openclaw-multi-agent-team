'use strict';

function printPlan(actions, { apply = false } = {}) {
  console.log(apply ? '# Apply actions' : '# Dry-run actions');
  for (const action of actions) {
    if (action.type === 'copy') console.log(`${apply ? 'COPY' : 'would copy'} ${action.src} -> ${action.dest}`);
    else if (action.type === 'mkdir') console.log(`${apply ? 'MKDIR' : 'would mkdir'} ${action.path}`);
    else if (action.type === 'symlink') console.log(`${apply ? 'SYMLINK' : 'would symlink'} ${action.path} -> ${action.target}`);
    else console.log(`${apply ? 'DO' : 'would do'} ${JSON.stringify(action)}`);
  }
}

function printResults(results) {
  const counts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ status: 'ok', counts }, null, 2));
}

module.exports = { printPlan, printResults };
