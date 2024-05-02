import { App, Editor, MarkdownView, Modal, Notice, Plugin} from 'obsidian';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
var child_process = require('child_process');

export default class MyPlugin extends Plugin {

	async onload() {

		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: async (editor: Editor, view: MarkdownView) => {


				const selection = editor.getCodeBlocks();

				const root = '/opt/homebrew/bin/swiftformat'
				const args = [
					'stdin',
					'--quiet',
					'--swiftversion',
					'5.10',
					'--emptybraces',
					'linebreak',
					'--wrapcollections',
					'before-first',
					'--wraparguments',
					'before-first',
				];
				const options = {
					'input': selection
				}
				var sfmt = child_process.spawn(root, args, options);

				// Although .exec() is buffered for us,
				// we'd have to escape everything we pass in. Boo.
				var buffer: any[] = []

				sfmt.stderr.on('data', (chunk: any) => {
					new ErrorModal(this.app, `${chunk}`).open()
				})

				sfmt.stdout.on('data', (chunk: any) => {
					buffer.push(chunk)
				});

				sfmt.on('close', (code: any) => {
					console.log(`closed stream with code ${code}`)
					editor.replaceSelection(`${buffer.join('')}`)
				})


				sfmt.stdin.write(selection);
				sfmt.stdin.end();
			}
		});
	}

	onunload() {

	}
}

class ErrorModal extends Modal {
	constructor(app: App, message: string) {
		super(app);
		const { contentEl } = this;
		contentEl.setText(message);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
