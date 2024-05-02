import { App, Editor, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNodeRef } from '@lezer/common';
import { linter, lintGutter, Diagnostic } from '@codemirror/lint';
import { it } from 'node:test';


const util = require('util');
const exec = util.promisify(require('child_process').exec);
var child_process = require('child_process');

export default class MyPlugin extends Plugin {

	async onload() {
		this.getExtension()


		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: async (editor: Editor, view: MarkdownView) => {


				const selection = this.getCodeBlocks(editor);

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


	getCodeBlocks(editor: Editor) {
		return editor.getSelection()

	}

	getExtension() {

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (view === null) {
			return "null view"
		}

		const editorView: EditorView = (view.editor as any).cm as EditorView;


		this.registerEditorExtension(
			linter((editorView: EditorView) => {
				let cursor = syntaxTree(editorView.state).cursor()
				cursor.firstChild()

				return [{
					from: cursor.from,
					to: cursor.to,
					severity: "warning",
					message: "blah",
					actions: []
				}]
			}))

		this.registerEditorExtension(lintGutter())
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
