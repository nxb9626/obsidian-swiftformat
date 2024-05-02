import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

var util = require('util');
const exec = util.promisify(require('child_process').exec);
var child_process = require('child_process');


// Remember to rename these classes and interfaces!

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

		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: async (editor: Editor, view: MarkdownView) => {
		// 		const selection = editor.getSelection();

		// 		// const { stdout, stderr } = await exec(`echo -n ${selection} | /opt/homebrew/bin/swiftformat stdin --enable "all" --verbose --swiftversion "5.10" | cat -`);
		// 		const { stdout, stderr } = await exec(`cat - ${selection} | cat -`);
		// 		console.log(`stdout: ${stdout}`);
		// 		console.log(`stderr: ${stderr}`);
		// 		console.log(`DID IT`)
		// 		// editor.replaceSelection(result);
		// 		// editor.replaceSelection('Sample Editor Command');
		// 	}
		// });

		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();

				// const { stdout, stderr } = await exec(`echo -n ${selection} | /opt/homebrew/bin/swiftformat stdin --enable "all" --verbose --swiftversion "5.10" | cat -`);

				var sfmt = child_process.spawn('cat', ['/dev/stdin']);


				sfmt.stdin.write(selection);
				sfmt.stdin.end();
				
				sfmt.stdout.on('data', (chunk: any) => {
						console.log(chunk.toString);
					});
				
				// console.log(`stdout: ${stdout}`);
				// console.log(`stderr: ${stderr}`);
				// editor.replaceSelection(result);
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
						new SampleModal(this.app).open();
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
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