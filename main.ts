import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
var child_process = require('child_process');


interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: async (editor: Editor, view: MarkdownView) => {


				const selection = editor.getSelection();

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

		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						// new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
