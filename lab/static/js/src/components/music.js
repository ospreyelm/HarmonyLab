define([
	'jquery',
	'lodash', 
	'app/config',
	'app/components/events',
	'app/components/component',
	'./music/play_sheet'
], function(
	$, 
	_, 
	Config,
	EVENTS,
	Component,
	PlainSheetComponent
) {
	/**
	 * This is a map of analysis modes to booleans indicating whether the mode
	 * is enabled or disabled by default.
	 * @type {object}
	 */
	var ANALYSIS_SETTINGS = Config.get('general.analysisSettings');
	/**
	 * This is a map of highlight modes to booleans indicating whether the mode
	 * is enabled or disabled by default.
	 * @type {object}
	 */
	var HIGHLIGHT_SETTINGS = Config.get('general.highlightSettings');

	var STAFF_DISTRIBUTION = Config.get('general.staffDistribution');

	/**
	 * Creates an instance of MusicComponent.
	 *
	 * This object is responsible for displaying the sheet music and
	 * handling runtime configuration changes.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {Sheet} settings.sheet Required property.
	 */
	var MusicComponent = function(settings) {
		this.settings = settings || {};
		this.settings.analysisSettings = this.settings.analysisSettings || {};
		this.settings.highlightSettings = this.settings.highlightSettings || {};

		/**
		 * Defines the music element.
		 * @type {jQuery}
		 */
		this.el = $('<div></div>');
		/**
		 * Configuration settings for highlighting notes on the sheet music.
		 * @type {object}
		 */
		this.highlightConfig = _.extend({}, HIGHLIGHT_SETTINGS, this.settings.highlightSettings);
		/**
		 * Configuration settings for analyzing notes on the sheet music.
		 * @type {object}
		 */
		this.analyzeConfig = _.extend({tempo:false}, ANALYSIS_SETTINGS, this.settings.analysisSettings);
		/**
		 * Configuration settings for staff distribution on the sheet music.
		 * @type {object}
		 */
		this.staffDistributionConfig = _.extend({}, STAFF_DISTRIBUTION, this.settings);
		

		if(!("sheet" in this.settings)) {
			throw new Error("missing settings.sheet parameter");
		}

		// this.setComponent("pristine", this.settings.pristine);
		this.setComponent("sheet", this.settings.sheet);

		_.bindAll(this, [
			'onAnalyzeChange',
			'onHighlightChange',
			'onStaffDistributionChange',
			'onMetronomeChange',
			'onRedrawRequest'
		]);
	};

	MusicComponent.prototype = new Component();

	_.extend(MusicComponent.prototype, {
		/**
		 * Initializes the music.
		 *
		 * @return undefined
		 */
		initComponent: function() {
			this.initListeners();
		},
		/**
		 * Initializes event listeners.
		 *
		 * @return undefined
		 */
		initListeners: function() {
			this.subscribe(EVENTS.BROADCAST.HIGHLIGHT_NOTES, this.onHighlightChange);
			this.subscribe(EVENTS.BROADCAST.ANALYZE_NOTES, this.onAnalyzeChange);
			this.subscribe(EVENTS.BROADCAST.ANALYZE_NOTES, this.onStaffDistributionChange); // ?
			this.subscribe(EVENTS.BROADCAST.METRONOME, this.onMetronomeChange);
			this.subscribe(EVENTS.BROADCAST.PRISTINE, this.onRedrawRequest);
		},
		/**
		 * Renders the music.
		 *
		 * @return this
		 */
		render: function() { 
			this.renderSheet();
			return this;
		},
		/**
		 * Renders the sheet.
		 *
		 * @return this
		 */
		renderSheet: function() {
			var sheetComponent = this.getComponent('sheet');
			sheetComponent.clear();
			sheetComponent.render();
			return this;
		},
		renderPristine: function() {
			var sheetComponent = this.getComponent('sheet');

			if (sheetComponent.hasOwnProperty('exerciseContext')) {
				// for debugging only
				// console.log('exercise view, call of renderPristine');
				// var items = sheetComponent.exerciseContext.inputChords.items();
				// var chords = _.pluck(items, "chord");
				// if (chords.length > 1) console.log('most recent played chord', chords[chords.length-2].getNoteNumbers());
			} else {
				// for debugging only
				// console.log('play view, call of renderPristine');
				// var items = sheetComponent.chords.items();
				// var chords = _.pluck(items, "chord");
				// console.log('most recent banked chord', chords[1].getNoteNumbers());
			}

			if (sheetComponent.hasOwnProperty('exerciseContext')) {
				/* exercise view */
				sheetComponent.exerciseContext.inputChords.clear();
				sheetComponent.exerciseContext.inputChords.goTo(0);
				window.console.dir('send dummy note');
				this.broadcast(EVENTS.BROADCAST.NOTE, 'on', 109, 0);
				this.broadcast(EVENTS.BROADCAST.NOTE, 'off', 109, 0);
			} else {
				/* play view */
				sheetComponent.chords.clear();
			}
			sheetComponent.clear();
			sheetComponent.render();

			return this;
		},
		/**
		 * Returns the width.
		 *
		 * @return {number}
		 */
		getWidth: function() {
			return this.el.width(); 
		},
		/**
		 * Returns the height.
		 *
		 * @return {number}
		 */
		getHeight: function() {
			return this.el.height();
		},
		/**
		 * Handles a change to the highlight settings.
		 *
		 * @param {object} settings
		 * @return undefined
		 */
		onHighlightChange: function(settings) {
			this.updateSettings('highlightConfig', settings);
			this.trigger('change');
		},
		/**
		 * Handles a change to the analyze settings.
		 *
		 * @param {object} settings
		 * @return undefined
		 */
		onAnalyzeChange: function(settings) {
			this.updateSettings('analyzeConfig', settings);
			this.trigger('change');
		},
		/**
		 * Handles a change to the staff distribution setting.
		 *
		 * @param {object} settings
		 * @return undefined
		 */
		onStaffDistributionChange: function(settings) {
			this.updateSettings('staffDistributionConfig', settings);
			this.trigger('change');
		},
		/**
		 * Handles a change to the metronome settings.
		 *
		 * @param {object} settings
		 * @return undefined
		 */
		onMetronomeChange: function(metronome) {
			if(metronome.isPlaying()) {
				this.analyzeConfig.tempo = metronome.getTempo();
			} else {
				this.analyzeConfig.tempo = false;
			}
			this.render();
		},
		onRedrawRequest: function() {
			this.renderPristine();
		},
		/**
		 * Updates settings.
		 *
		 * @param {string} prop
		 * @param {object} setting
		 * @return this
		 */
		updateSettings: function(prop, setting) {
			var mode = _.cloneDeep(this[prop].mode);
			switch(setting.key) {
				case "enabled":
					this[prop].enabled = setting.value; 
					break;
				case "mode":
					_.assign(mode, setting.value);	
					this[prop].mode = mode;
					break;
				default:
					throw new Error("Invalid setting key");
			}
			return this;
		},
	});

	return MusicComponent;
});
