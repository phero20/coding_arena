const fs = require('fs');
const path = require('path');

const srcDir = "C:\\Users\\mdfer\\.gemini\\antigravity\\brain\\57bbfcb2-53f7-41ea-94ac-9f8843426f07";
const destDir = path.join(__dirname, 'docs', 'diagrams');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = [
  { src: 'system_architecture_1775323841523.png', dest: 'system_architecture.png' },
  { src: 'submission_flow_1775323869456.png', dest: 'submission_flow.png' },
  { src: 'match_lifecycle_1775323894254.png', dest: 'match_lifecycle.png' },
  { src: 'database_erd_1775323927980.png', dest: 'database_erd.png' },
  { src: 'realtime_websocket_1775323954492.png', dest: 'realtime_websocket.png' },
  { src: 'api_layer_diagram_1775323982518.png', dest: 'api_layer_diagram.png' },
  { src: 'uml_use_case_1775324850643.png', dest: 'uml_use_case.png' },
  { src: 'uml_class_1775324878254.png', dest: 'uml_class.png' },
  { src: 'uml_component_1775324905121.png', dest: 'uml_component.png' },
  { src: 'uml_deployment_1775324928846.png', dest: 'uml_deployment.png' },
  { src: 'uml_sequence_1775325192725.png', dest: 'uml_sequence.png' },
  { src: 'uml_activity_1775325217373.png', dest: 'uml_activity.png' },
];

filesToCopy.forEach(f => {
  try {
    fs.copyFileSync(path.join(srcDir, f.src), path.join(destDir, f.dest));
    console.log("Copied " + f.dest);
  } catch (err) {
    console.error("Error copying " + f.src, err.message);
  }
});
