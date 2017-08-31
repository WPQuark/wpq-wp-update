/**
 * WPQuark Plugin Framework
 *
 * This is a jQuery plugin which works on the plugin framework to populate the UI
 * Admin area
 *
 * @dependency jquery, jquery-ui-widget, jquery-ui-mouse, jquery-ui-button, jquery-touch-punch, jquery-ui-draggable,
 * jquery-ui-droppable, jquery-ui-sortable, jquery-ui-datepicker, jquery-ui-dialog, jquery-ui-tabs, jquery-ui-slider,
 * jquery-ui-spinner, jquery-ui-progressbar, jquery-timepicker-addon, jquery-print-element, jquery-mwheelIntent, jquery-mousewheel
 *
 * @author Swashata Ghosh <swashata@wpquark.com>
 * @version 2
 * @license    GPL v3
 */

;(function ( $, window, document, undefined ) {
	"use strict";
	var pluginName = "initWPQSPUI",
	defaults = {
		applyUIOnly: false,
		callback: null
	};

	// The actual plugin constructor
	function Plugin ( element, options ) {
		this.element = element;
		this.jElement = $(this.element);
		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			// Apply UI only if the settings say so
			if ( this.settings.applyUIOnly === true ) {
				this.initUIElements();
				this.initSDA( true );
				return;
			}

			// Otherwise apply everything

			// Call the UI elements
			this.initUIElements();

			// Call the delegation functions
			this.initUIElementsDelegated();

			// Call the SDA
			this.initSDA( false );
		},

		// Just a safe log to console
		debugLog: function( variable ) {
			try {
				if ( console && console.log ) {
					console.log( variable );
				}
			} catch( e ) {

			}
		},


		/**
		 * Initialize the Sortable/Deletable/Addable
		 *
		 * @method     initSDA
		 */
		initSDA: function( forUI ) {
			var that = this;
			this.jElement.find('.ipt_uif_sda').each(function() {
				// Initialize the SDA UI
				that.uiSDAinit.apply(this);

				// Initialize the sortables for SDA
				that.uiSDAsort.apply(this);
			});
			if ( forUI === true ) {
				return;
			}

			// Call the delegatory methods
			that.edSDAattachAdd();
			that.edSDAattachDel();
		},


		/**
		 * Initialize the static UI elements which are not/can not be delegated
		 *
		 * @method     initUIElements
		 */
		initUIElements: function() {
			// Check the selectors of every checkbox togglers
			this.uiCheckboxToggler();

			// Sliders
			this.uiApplySlider();

			// Progressbar
			this.uiApplyProgressBar();

			// Date and DateTime Picker
			this.uiApplyDateTimePicker();

			// Font selector
			this.uiApplyFontSelector();

			// Theme selector
			this.uiApplyThemeSelector();

			// Uploader
			this.uiApplyUploader();

			// WP Color Picker
			this.uiApplyIRIS();

			// Conditional input and select
			this.uiApplyConditionalInput();
			this.uiApplyConditionalSelect();

			// Collapsebox
			this.uiApplyCollapsible();

			// Select
			this.uiApplySelectMenu();

			// Tabs
			this.uiApplyTabs();

			// AutoCompletes
			this.uiApplyAutoComplete();

			// Show/Hide inits
			this.uiApplyUIInits();

			// Apply IconPicker
			this.uiApplyIconSelector();
		},

		// Autocomplete
		uiApplyAutoComplete: function() {
			this.jElement.find('.ipt_uif_autocomplete').each(function() {
				$(this).autocomplete({
					source: $(this).data('autocomplete'),
					appendTo : $(this).parents('.ipt_uif_front')
				});
			});
		},

		uiApplyUIInits: function() {
			this.jElement.find( '.ipt_uif_ui_init_loader' ).hide();
			this.jElement.find( '.ipt_uif_ui_hidden_init' ).css( 'visibility', 'visible' ).fadeIn( 'fast' );
		},

		// UI Select Menu
		uiApplySelectMenu: function() {
			if ( typeof( $.fn.select2 ) == 'undefined' ) {
				return;
			}
			$( 'select.ipt_uif_select:not(.ipt_uif_heading_type)' ).select2();
			// Something special for the heading
			$( 'select.ipt_uif_heading_type' ).select2({
				templateResult: function( state ) {
					return $( '<span class="ipt_uif_ht heading-' + state.id + '">' + state.text + '</span>' );
				}
			});
		},

		// Checkbox Toggler
		uiCheckboxToggler: function() {
			// Loop through every toggler and add listener to the selectors too
			var jElement = this.jElement;
			jElement.find('.ipt_uif_checkbox_toggler').each(function() {
				var _self = $(this);
				if ( _self.is(':checked') ) {
					$(_self.data('selector')).prop('checked', true);
				}
			});
		},

		// Sliders
		uiApplySlider: function() {
			this.jElement.find('.ipt_uif_slider').each(function() {
				var step, min, max, value, slider_range, slider_settings, second_value, first_input = $(this), second_input = null,
				count_div, slider_div, slider_div_duplicate;

				// Get the settings
				step = parseFloat( $(this).data('step') );
				if( isNaN( step ) ) {
					step = 1;
				}

				min = parseFloat( $(this).data('min') );
				if( isNaN( min ) ) {
					min = 1;
				}

				max = parseFloat( $(this).data('max') );
				if( isNaN( max ) ) {
					max = null;
				}

				value = parseFloat( $(this).val() );
				if( isNaN( value ) ) {
					value = min;
				}

				slider_range = $(this).hasClass('slider_range') ? true : false;

				slider_settings = {
					min: min,
					max: max,
					step: step,
					range: false
				};

				// Get the second input if necessary
				if ( slider_range ) {
					second_input = first_input.next('input');
					second_value = parseFloat( second_input.val() );
					if( isNaN( second_value ) ) {
						second_value = min;
					}
				}

				// Prepare the show count
				count_div = first_input.prev('div.ipt_uif_slider_count');

				// Append the div
				slider_div = $('<div />');
				slider_div.addClass(slider_range ? 'ipt_uif_slider_range' : 'ipt_uif_slider_single').addClass('ipt_uif_slider_div');

				// Remove the duplicate div
				// Here for legecy purpose
				if ( slider_range ) {
					slider_div_duplicate = second_input.next('div');
				} else {
					slider_div_duplicate = first_input.next('div');
				}
				if ( slider_div_duplicate.length ) {
					slider_div_duplicate.remove();
				}

				if ( slider_range ) {
					second_input.after(slider_div);
				} else {
					first_input.after(slider_div);
				}

				//Prepare the slide function
				if ( ! slider_range ) {
					slider_settings.slide = function( event, ui ) {
						first_input.val(ui.value);
						if ( count_div.length ) {
							count_div.find('span').text(ui.value);
						}
					};
					slider_settings.value = value;
				} else {
					//alert('atta boy');
					slider_settings.slide = function( event, ui ) {
						first_input.val(ui.values[0]);
						second_input.val(ui.values[1]);
						if( count_div.length ) {
							count_div.find('span.ipt_uif_slider_count_min').text(ui.values[0]);
							count_div.find('span.ipt_uif_slider_count_max').text(ui.values[1]);
						}
					};
					slider_settings.values = [value, second_value];
					slider_settings.range = true;
				}

				// Init the counter
				if ( count_div.length ) {
					if ( slider_range ) {
						count_div.find('span.ipt_uif_slider_count_min').text(value);
						count_div.find('span.ipt_uif_slider_count_max').text(second_value);
					} else {
						count_div.find('span').text(value);
					}
				}

				//Init the slider
				slider_div.slider( slider_settings );
			});
		},

		// Progress bar
		uiApplyProgressBar: function() {
			this.jElement.find('.ipt_uif_progress_bar').each(function() {
				//First get the start value
				var progress_self = $(this),
				start_value = progress_self.data('start') ? progress_self.data('start') : 0,
				//Add the value to the inner div
				value_div = progress_self.find('.ipt_uif_progress_value').addClass('code');
				value_div.html(start_value + '%');

				//Init the progressbar
				var progressbar = progress_self.progressbar({
					value : start_value,
					change : function(event, ui) {
						value_div.html($(this).progressbar('option', 'value') + '%');
					}
				});

				if(progress_self.next('.ipt_uif_button_container').find('.ipt_uif_button.progress_random_fun').length) {
					progress_self.next('.ipt_uif_button_container').find('.ipt_uif_button.progress_random_fun').on('click', function() {
						//this.preventDefault();
						var new_value = parseInt(Math.random()*100);
						progressbar.progressbar('option', 'value', new_value);
						return false;
					});
				}
			});
		},

		// Icon Selector
		uiApplyIconSelector: function() {
			var source = {"Web Applications":[58044,59503,57865,59542,58834,57975,59574,59576,59583,59592,61451,61453,61454,61456,61465,61474,61486,61498,61587,61591,61598,61612,61642,61643,61677,61678,61709,61710,61734,61897,61946,62006,62070,58892,57440,57442,57443,57464,57465,57467,57486,57487,57488,57489,57512,57513,57531,57544,57367,57557,57558,57559,57560,57561,57562,57563,57564,57571,57572,57582,57583,57620,57653,57654,57655,57657,57658,57659,57661,57662,57663,57665,57666,57667,57669,57670,57671,57673,57674,57675,57388,57389,57739,57740,57741,57749,57750,57765],"Spinners":[61712,61959,57507,57362,57508,57509,57510,57511,57730],"Business Icons":[57837,57886,57887,59654,59624,61447,61574,61669,61670,61680,61787,61901,61904,61930,61979,62004,62005,62023,57427,57428,57439,57444,57445,57350,57351,57461,57463,57360,57498,57499,57500,57501,57361,57502,57503,57504,57505,57541,57545,57555,57713,57715,57716,57717,57720,57721,57722,57731,57733,57787,57788],"eCommerce":[61483,61484,61562,61597,61881,61932,61975,61976,62083,57452,57453,57457,57354,57459,57460,57724],"Currency Icons":[61654,61779,61780,61781,61782,61783,61784,61785,61786,61845,57458],"Form Control Icons":[58826,57990,61460,61510,61528,61533,61636,61637,61639,61770,61944,62068,57441,57352,57353,57446,57447,57448,57369,57625,57626,57371,57723,57732,57744,57745],"User Action & Text Editor":[58344,57884,57974,59608,58032,61449,61450,61489,61490,61491,61494,61495,61496,61497,61499,61500,61541,61582,61633,61638,61644,61645,61646,61666,61674,61735,61757,61772,62039,57493,57494,57495,57514,57515,57363,57516,57517,57372,57681,57682,57683,57684,57685,57686,57687,57688,57689,57377,57423,57690,57691,57734,57747,57748,57751,57752,57753,57754,57756,57757,57758,57760,57761],"Charts and Codes":[59077,61481,61482,61568,61641,61950,61952,61953,57454,57455,57529,57530,57365,57737],"Attentive":[59543,59534,57987,61529,61530,61553,61736,62108,57520,57521,57614,57615,57616,57617,57618,57619,57622],"Multimedia Icons":[57854,57869,58384,57953,57962,61441,61448,61469,61478,61479,61480,61501,61502,61515,61520,61521,61764,61802,61893,61905,62091,62092,62112,58885,57347,57348,57349,57496,57574,57575,57627,57628,57630,57631,57632,57633,57635,57636,57637,57639,57640,57641,57642,57643,57644,57645,57646,57647,57648,57650,57651,57656,57660,57664,57668,57672,57676,57416,57417,57418,57719,57729,57755,57759,57778],"Location and Contact":[57807,57824,59530,58715,58018,61443,61505,61592,61664,61725,61726,61732,61849,62071,62072,62073,58923,57344,57425,57426,57462,57466,57468,57469,57472,57484,57550,57566,57376,57726,57762,57764],"Date and Time":[59499,58020,61463,61555,61747,61914,62065,62066,62067,57473,57474,57475,57476,57477,57479,57480,57481,57629,57634],"Devices":[58130,59565,58159,61572,61704,61724,62021,62060,57482,57355,57518,57519,57569,57725,57727],"Tools":[58323,61459,61504,61558,61573,61596,61613,61758,61771,61948,57345,57429,57430,57431,57433,57421,57522,57523,57420,57524,57525,57539,57542,57679,57680,57415,57736],"Social Networking":[59405,61509,61540,61543,61569,61570,61580,61586,61593,61594,61595,61634,61650,61651,61652,61653,61665,61715,61773,61811,61812,61844,61850,61854,61856,61857,61858,61859,61860,61886,61907,61920,61921,61929,61954,61955,62000,62001,62077,62081,58893,58905,58910,58911,57449,57556,57624,57638,57378,57379,57380,57381,57382,57383,57384,57385,57386,57387,57390,57391,57392,57422,57692,57394,57693,57395,57694,57695,57696,57697,57698,57699,57700,57396,57701,57702,57703,57397,57704,57399,57705,57706,57402,57708,57403,57404,57405,57406,57407,57408,57709,57409,57710,57712,57763,57766,57767,57768,57769,57770,57771,57772,57773,57774,57775,57780,57782,57783,57784,57785,57786],"Brands Icons":[59481,61549,61755,61756,61817,61818,61820,61822,61866,61933,61940,62055,62056,62057,62058,62059,57451,57540,57398,57707,57400,57401,57410,57711,57413,57718,57776,57777,57779,57781,57789,57790,57791,57792,57793,57794],"Files & Documents":[58055,61462,61564,61686,61716,61717,61788,61882,61889,61890,61891,61892,61894,61895,61896,57450,57357,57358,57485,57553,57714,57411,57412,57728],"Travel and Living":[61464,61554,61649,61684,61691,61765,61912,61913,57456,57532,57533,57534,57535,57537,57546,57547,57548,57621,57742,57743,57746],"Weather & Nature Icons":[61548,61748,61829,61830,58880,58881,58882,58883,58884,58886,58887,58889,58890,58891,58894,58895,58896,58897,58898,58899,58900,58901,58902,58903,58904,58906,58907,58908,58909,58912,58913,58914,58915,58916,58917,58918,58919,58920,58921,57536,57552,57573],"Like & Dislike Icons":[59448,61444,61446,61550,61552,61575,61576,61577,61578,61581,61731,61796,61797,57568,57570,57576,57577,57578,57579,57580,57581],"Emoticons":[61720,61721,61722,57584,57585,57586,57587,57588,57589,57590,57591,57592,57593,57594,57595,57596,57597,57598,57599,57600,57601,57602,57603,57604,57605,57606,57607,57608,57609],"Directional Icons":[58840,61466,61467,61536,61537,61538,61539,61608,61609,61610,61611,61813,61814,61815,61816,61838,61840,57470,57610,57611,57612,57613],"Material Icons: Action":[59469,59668,59471,59472,59473,59475,59478,59476,59479,59480,59659,59482,59483,59486,59487,59488,59489,59490,59491,59502,59622,59623,59496,59497,59498,59639,59640,59500,59501,59669,59553,59506,59691,59507,59509,59510,59511,59671,59672,59686,59651,59513,59514,59515,59516,59517,59524,59520,59521,59661,59652,59653,59522,59523,59567,59656,59526,59527,59645,59528,59571,59531,59532,59650,59666,59535,59537,59538,59539,59550,59663,59673,59674,59596,59610,59572,59544,59545,59546,59547,59548,59658,59549,59551,59552,59685,59554,59555,59557,59559,59560,59561,59677,59562,59665,59563,59564,59678,59568,59679,59636,59688,59689,59680,59681,59577,59578,59579,59581,59580,59582,59585,59586,59587,59588,59589,59590,59591,59593,59594,59595,59597,59690,59598,59602,59603,59604,59605,59607,59611,59612,59613,59682,59614,59615,59616,59617,59618,59619,59620,59621,59683,59625,59626,59627,59628,59629,59630,59631,59632,59634,59635,59637,59684,59641,59642,59647,59649,61442,61445,61461,61475,61485,61487,61667,61668,61729,61737,61819,61867,61945,61980,57549,57677,57735],"Material Icons: Alert":[57797,57855,57856],"Material Icons: AV":[57800,57801,57803,57804,57806,57808,57819,57831,57836,57849,57857,57858,57859,57860,57861,57863,57870,57871,57872,57873,57878,57879,57880,57893,57931,57934,57937,57943,57947,57954,57956,57961,57963,57964,57965,57966,57970,57971,57972,57973,57977,57979,57980,57981,57982,57983,58009,58010,58011,58014,58016,58024,58025,58026,58037,58038,58039,58040,58041,58043,58045,58052,58053,58061,58062,61470,61516,61517,57364,57649,57652],"Material Icons: Communication":[57825,57826,57827,57828,57829,57830,57832,57833,57834,57835,57838,57839,57840,57847,57848,57881,57882,57885,57888,57889,57891,57892,57957,57958,57959,57960,57967,57968,57988,57989,57995,58012,58013,58019,58021,58027,58042,58058,61557,61589],"Material Icons: Content":[57796,57798,57799,57809,57814,57841,57842,57843,57845,57850,57851,57853,57867,57868,57874,57890,57936,57944,57976,57985,57986,57997,58029,58031,58063,61468,61476,61518,61660,61831,57490,57491,57497,57543,57565,57375],"Material Icons: Device":[57795,57802,57811,57812,57813,57816,57817,57818,57820,57821,57822,57823,57844,57846,57852,57875,57876,57877,57941,57942,57945,57946,57991,57992,57993,57994,57996,57999,58002,58003,58004,58005,58006,58007,58008,58059,58065,58066,62087,62099,57359],"Material Icons: Editor":[57894,57895,57896,57897,57898,57899,57900,57901,57902,57903,57904,57905,57906,57907,59101,57938,57940,57949,57935,57908,57909,57910,57911,57912,57913,57914,57915,57916,57917,57918,57919,57920,57921,57922,57923,57924,57950,57925,57926,57927,57928,57930,57951,57932,57933,57952,57939,57955,57948,59103,59076,57969,58000,59105,58017,58023,58028,58030,58034,58035,58036,58067],"Material Icons: File":[58051,58046,58047,58048,58049,58050,58060,58054,58056,58057,61563,58888,57567],"Material Icons: Hardware":[58119,58120,58123,58124,58165,58150,58167,58126,58128,58129,58131,58132,58133,58134,58135,58136,58138,58139,58140,58141,58143,58144,58145,58146,58147,58148,58149,58151,58166,58152,58153,58154,58155,58157,58158,58160,58161,58162,58164,61705,61706,61723,57483,57356],"Material Icons: Image":[58425,58298,58273,58274,58275,58276,58277,58278,58279,58280,58281,58285,58286,58428,58386,58289,58290,58291,58292,58293,58376,58377,58413,58387,58417,58378,58296,58297,58299,58300,58301,58307,58304,58305,58306,58308,58309,58423,58310,58311,58312,58314,58315,58316,58317,58318,58319,58320,58321,58322,58324,58325,58326,58327,58328,58329,58330,58331,58332,58333,58334,58336,58338,58339,58340,58341,58342,58343,58345,58346,58347,58348,58349,58350,58353,58354,58355,58357,58400,58358,58360,58361,58362,58424,58364,58363,58365,58366,58367,58368,58369,58370,58371,58372,58426,58373,58374,58375,58379,58381,58382,58383,58385,58427,58418,58419,58420,58389,58390,58392,58393,58394,58395,58396,58397,58398,58399,58401,58402,58405,58403,58404,58406,58407,58408,58409,58410,58411,58421,58412,58414,58416,61488,61506,61508,61616,61733,57346,57492],"Material Icons: Maps":[58727,58681,58669,58670,58671,58672,58673,58677,58678,58728,58733,58724,58716,58697,58683,58684,58707,58685,58686,58688,58689,58690,58691,58721,58692,58693,58694,58696,58698,58699,58700,58702,58703,58704,58706,58712,58713,58717,58729,58714,58730,58718,58720,58732,58722,58723,58734,58725,58737,58738,58731,62008,62009,57471],"Material Icons: Navigation":[58927,58928,58930,58931,58932,58933,58934,58935,58819,58820,58843,58821,58822,58823,58824,58825,58936,58937,58938,58947,58939,58943,58940,58941,58942,58830,58831,58944,58844,58945,58832,58833,58845,58946,58948,58949,58950,58835,58836,58951,58952,58953,58954,58955,58956,58957,58958,58959,58960,58961,58962,58963,58965,58841,58842,58966,58967,58968,58969,58970,58971,58972,58973,61452,61473,61931,57368,57623],"Material Icons: Places":[60219,60220,60221,60222,60223,60224,60225,60227,60228,60229,60230,60231,60232,60233,58964,60234,60236],"Material Icons: Social":[59393,59374,59369,59387,59376,59377,59379,59380,59383,59381,59382,59384,59385,59386,59388,59391,59389,59390,59392,59403,59404,59409,59410,59411,59412,59413,59406,61632,57374],"Material Icons: Toggle":[59444,59445,59657,59446,59447,59450,59449],"Other Icons":[59477,59573,59470,58270,58929,57805,59485,58271,57810,57815,58287,59644,59569,60226,58829,58142,59660,58302,59505,59670,58125,58674,58676,58726,59643,59518,57862,57864,57866,57929,59687,59662,59648,57883,59536,59540,59675,59676,59556,58837,59646,57978,57984,57998,58001,60235,58015,59600,58022,58735,59606,59609,59667,58736,58163,58838,58839,58033,58168,59633,58422,58064,58974,61440,61457,61458,61477,61492,61493,61507,61511,61512,61513,61514,61522,61523,61524,61525,61526,61527,61531,61532,61534,61542,61544,61545,61546,61547,61556,61559,61560,61561,61565,61566,61571,61579,61584,61585,61588,61590,61600,61601,61602,61603,61604,61605,61606,61607,61614,61617,61618,61635,61640,61648,61655,61656,61657,61658,61659,61661,61662,61671,61672,61673,61675,61676,61681,61682,61683,61685,61687,61688,61689,61690,61692,61693,61694,61696,61697,61698,61699,61700,61701,61702,61703,61707,61708,61713,61714,61728,61730,61738,61739,61740,61741,61742,61744,61745,61746,61749,61750,61751,61752,61753,61754,61760,61761,61762,61763,61766,61767,61768,61769,61774,61776,61777,61778,61789,61790,61792,61793,61794,61795,61798,61799,61800,61801,61803,61804,61805,61806,61808,61809,61810,61821,61824,61825,61826,61827,61828,61832,61833,61834,61835,61836,61837,61841,61842,61843,61846,61847,61848,61851,61852,61853,61861,61862,61863,61864,61865,61868,61869,61870,61872,61873,61874,61875,61876,61877,61878,61879,61880,61883,61884,61885,61888,61898,61899,61900,61902,61906,61908,61909,61910,61911,61915,61916,61917,61918,61922,61923,61924,61925,61926,61927,61928,61934,61936,61937,61938,61939,61941,61942,61943,61947,61949,61956,61957,61958,61960,61961,61962,61963,61964,61965,61966,61968,61969,61970,61971,61972,61973,61974,61977,61978,61981,61982,61985,61986,61987,61988,61989,61990,61991,61992,61993,61994,61995,61996,61997,62002,62003,62007,62010,62011,62012,62013,62014,62016,62017,62018,62019,62020,62022,62024,62025,62026,62027,62028,62029,62030,62032,62033,62034,62035,62036,62037,62038,62040,62041,62042,62043,62044,62045,62046,62048,62049,62050,62051,62052,62053,62054,62061,62062,62064,62069,62074,62075,62076,62078,62080,62082,62084,62085,62086,62088,62089,62090,62093,62094,62096,62097,62098,62100,62101,62102,62103,62104,62105,62106,62107,62109,62110,62113,62114,62115,62116,62117,62118,62119,62120,62121,62122,62123,62124,62125,58922,58924,58925,58926,57432,57434,57435,57436,57437,57438,57478,57506,57526,57527,57528,57366,57538,57551,57554,57419,57370,57424,57678,57373,57393,57414,57738]},
			searchSource = {"Web Applications":["Attachment 2","Code 3","Fiber pin","List 4","Menu 3","Remove 4","Search 3","Settings 2","Settings input antenna","Settings voice","Th list","Close 2","Search plus","Search minus","Download","List alt","Bookmark","List","Upload","Bookmark o","Feed 5","Globe","List ul","List ol","Cloud download","Cloud upload","Quote left","Quote right","Code fork","File code o","At","Bed","Map pin","Lines","Connection","Feed","Book 2","Address book","Notebook","Pushpin","Box add","Box remove","Download 2","Upload 2","Binoculars","Search 2","Gift 2","Remove 2","List 2","Cloud download 2","Cloud upload 2","Download 3","Upload 3","Download 4","Upload 4","Globe 2","Earth","Bookmark 2","Bookmarks","Thumbs up 2","Thumbs up 3","Cancel circle","Arrow up left","Arrow up 2","Arrow up right","Arrow down right","Arrow down 2","Arrow down left","Arrow up left 2","Arrow up 3","Arrow up right 2","Arrow down right 2","Arrow down 3","Arrow down left 2","Arrow up left 3","Arrow up 4","Arrow up right 3","Arrow down right 3","Arrow down 4","Arrow down left 3","Feed 2","Feed 3","List 3","Numbered list","Menu 2","Code 2","Embed","Feed 4"],"Spinners":["Spinner","Bus","Busy","Spinner 2","Spinner 3","Spinner 4","Spinner 5","Spinner 6","Spinner 7"],"Business Icons":["Comment 2","Library books","Library music","Play for work","Verified user","User","Comments","Comment o","Comments o","User md","File","Life bouy","Ra","Newspaper o","User secret","User plus","User times","Object group","Office","Newspaper","Bullhorn 2","Books","Library","File 2","File 3","Support","Phone hang up","Bubbles","Bubbles 2","Bubble","Bubbles 3","Bubbles 4","Users","User 2","Users 2","User 3","User 4","Lab","Briefcase 2","Signup","Libreoffice","File openoffice","File xml","File css","Profile","File 4","File 5","Bubble 2","User 5","File word","File excel"],"eCommerce":["Tag","Tags","Shopping cart","Credit card","Automobile","Calculator","Cart plus","Cart arrow down","Credit card alt","Tag 2","Tags 2","Cart","Cart 2","Credit","Calculate","Cart 3"],"Currency Icons":["Money","Eur","Gbp","Dollar","Inr","Cny","Rouble","Krw","Bitcoin","Try","Coin"],"Form Control Icons":["Check 2","Save 2","Trash o","Check square o","Check circle","Check circle o","Cut","Copy","Floppy o","Check square","Trash","Calendar check o","Podcast","Copy 2","Copy 3","Paste 2","Paste 3","Paste 4","Spell check","Enter","Exit","Crop 2","Copy 4","Disk","Radio checked","Radio unchecked"],"User Action & Text Editor":["Flip 3","Link 3","Redo 3","Tab 2","Undo 4","Th large","Th","Font","Bold","Italic","Align left","Align center","Align right","Align justify","Dedent","Indent","Expand","External link","Chain","Paperclip","Strikethrough","Underline","Table","Rotate left","Clipboard","Chain broken","Anchor","External link square","Hand scissors o","Flip 2","Undo 2","Redo 2","Zoomin","Zoomout","Contract","Expand 2","Contract 2","Scissors","Font 2","Text height 2","Text width 2","Bold 2","Underline 2","Italic 2","Strikethrough 2","Omega","Sigma","Table 2","Pilcrow","Lefttoright","Righttoleft","Expand 3","Table 3","Insert template","Newtab","Indent decrease","Indent increase","Paragraph justify","Paragraph center","Paragraph left","Paragraph justify 2","Paragraph center 2","Paragraph left 2"],"Charts and Codes":["Pie chart outlined","Qrcode","Barcode","Bar chart","Bars","Area chart","Pie chart","Line chart","Barcode 2","Qrcode 2","Pie","Stats","Bars 2","Bars 3"],"Attentive":["Lock 4","Info 4","Warning 3","Question circle","Info circle","Exclamation triangle","Question","Question circle o","Lock 2","Lock 3","Warning 2","Notification","Question 2","Info 2","Info 3","Blocked","Spam"],"Multimedia Icons":["Equalizer 2","Forward 5","Photo 2","Pause 4","Play circle filled","Music","Film","Play circle o","Volume off","Volume down","Volume up","Video camera","Image 3","Play","Fast forward","Step forward","Play circle","Youtube play","File image o","Empire","Pause circle","Pause circle o","Volume control phone","Wind","Headphones 2","Play 2","Camera 2","Forward 2","Brightness contrast","Contrast","Play 3","Pause 2","Backward 2","Forward 3","Play 4","Pause 3","Backward 3","Forward 4","First","Previous","Next","Eject 2","Volume high","Volume medium","Volume low","Volume mute","Volume mute 2","Volume increase","Volume decrease","Loop 2","Loop 3","Arrow right 2","Arrow left 2","Arrow right 3","Arrow left 3","Arrow right 4","Arrow left 4","Image 2","Images","Camera 3","Film 2","Music 2","Paragraph right","Paragraph right 2","Windows 8"],"Location and Contact":["Flag 3","Phone 3","Home 5","Map 4","Speaker phone","Envelope o","Map marker","Phone square","Envelope","Flag o","Flag checkered","Location arrow","Envelope square","Map signs","Map o","Map 3","Compass","Home 2","Home 3","Home 4","Phone 2","Envelop","Location","Location 2","Map 2","Mobile","Target","Flag 2","Mail 2","Mobile 2","Mail 3","Mail 4"],"Date and Time":["Change history","Stop 4","Clock o","Calendar","Calendar o","History 2","Calendar plus o","Calendar minus o","Calendar times o","History","Clock","Clock 2","Alarm","Alarm 2","Stopwatch","Calendar 2","Calendar 3","Stop 2","Stop 3"],"Devices":["Keyboard 2","Print 3","Tablet 3","Key","Desktop","Keyboard o","Mouse pointer","Television","Print 2","Laptop 2","Key 2","Key 3","Eye blocked","Screen","Tablet 2"],"Tools":["Filter 4","Cog 3","Pencil","Magnet","Cogs 2","Unlock","Wrench","Unlock alt","Pencil square","Paint brush","Pencil 2","Quill","Pen","Blog","Paint format","Dice","Unlocked","Wrench 2","Cogs","Cog","Hammer","Hammer 2","Magnet 2","Filter 2","Filter 3","Pencil 3","Cog 2"],"Social Networking":["Share 3","Share square o","Mail forward","Plus","Twitter square","Facebook square","Linkedin square","Github square","Twitter","Facebook","Github","Cloud 6","Pinterest","Pinterest square","Google plus square","Google plus","Linkedin","Github alt","Share square","Tumblr","Tumblr square","Vimeo square","Wordpress 3","Yahoo 2","Google 2","Reddit 2","Reddit square","Stumbleupon circle","Stumbleupon 3","Soundcloud 3","Git","Share alt","Share alt square","Yelp 2","Lastfm 3","Lastfm square","Facebook official","Pinterest p","Vimeo 3","Reddit alien","Cloud 2","Cloud 3","Cloud 4","Cloud 5","Stack","Cloud 7","Plus 2","Last","Google","Googleplus","Googleplus 2","Googleplus 3","Google drive","Facebook 2","Facebook 3","Instagram 2","Twitter 2","Twitter 3","Youtube 2","Vimeo","Vimeo 2","Flickr 2","Flickr 3","Flickr 4","Picassa","Dribbble 2","Dribbble 3","Dribbble 4","Forrst","Forrst 2","Deviantart","Deviantart 2","Steam","Github 2","Github 3","Github 4","Github 5","Wordpress","Blogger","Tumblr 2","Tumblr 3","Yahoo","Soundcloud","Soundcloud 2","Reddit","Lastfm","Stumbleupon","Stackoverflow","Pinterest 2","Xing 2","Xing 3","Foursquare 2","Foursquare 3","Yelp","Twitter 4","Youtube 3","Vimeo 22","Flickr 5","Facebook 4","Googleplus 4","Picassa 2","Wordpress 2","Github 6","Steam 2","Blogger 2","Linkedin 2","Flattr","Pinterest 3","Stumbleupon 2","Delicious","Lastfm 2"],"Brands Icons":["Android 3","Fire","Html 5","Css 3","Apple","Windows","Linux","Skype","Joomla 2","Paypal 4","Cc paypal","Safari 2","Chrome 2","Firefox 2","Opera 2","Internet explorer","Folder open 2","Fire 2","Joomla","Tux","Finder","Windows 2","Paypal","Paypal 2","Html 52","Css 32","Apple 2","Android 2","Skype 2","Paypal 3","Html 53","Chrome","Firefox","IE","Safari","Opera"],"Files & Documents":["Folder 3","File o","Folder open","File text o","Folder o","Folder open o","File text","Cab","File pdf o","File word o","File excel o","File powerpoint o","File archive o","File audio o","File movie o","Folder 2","Drawer","Drawer 2","Drawer 3","Switch","File pdf","File zip","File powerpoint","Cabinet"],"Travel and Living":["Road","Plane","Truck","Coffee","Fighter jet","Ticket","Paper plane","Paper plane o","Ticket 2","Trophy 2","Glass 2","Mug","Food","Rocket 2","Airplane","Truck 2","Road 2","Checkmark circle","Checkmark","Checkmark 2","Checkbox checked"],"Weather & Nature Icons":["Leaf","Fire extinguisher","Sun o","Moon o","Sunrise","Sun","Moon","Sun 2","Windy","Snowflake","Cloudy","Weather","Weather 2","Weather 3","Lightning","Lightning 2","Rainy","Rainy 2","Windy 2","Windy 3","Snowy","Snowy 2","Snowy 3","Weather 4","Cloudy 2","Lightning 3","Sun 3","Moon 2","Cloudy 3","Lightning 4","Rainy 3","Rainy 4","Windy 4","Windy 5","Snowy 4","Snowy 5","Weather 5","Cloudy 4","Lightning 5","Leaf 2","Lightning 6","Brightness medium"],"Like & Dislike Icons":["Star 5","Heart","Star o","Eye","Eye slash","Thumbs o up","Thumbs o down","Star half","Heart o","Thumb tack","Star half empty","Thumbs up","Thumbs down","Eye 2","Eye 3","Star 2","Star 3","Star 4","Heart 2","Heart 3","Heart broken"],"Emoticons":["Smile o","Frown o","Meh o","Happy","Happy 2","Smiley","Smiley 2","Tongue","Tongue 2","Sad","Sad 2","Wink","Wink 2","Grin","Grin 2","Cool","Cool 2","Angry","Angry 2","Evil","Evil 2","Shocked","Shocked 2","Confused","Confused 2","Neutral","Neutral 2","Wondering","Wondering 2"],"Directional Icons":["Arrow upward","Arrow circle o down","Arrow circle o up","Arrow left","Arrow right","Arrow up","Arrow down","Arrow circle left","Arrow circle right","Arrow circle up","Arrow circle down","Long arrow down","Long arrow up","Long arrow left","Long arrow right","Arrow circle o right","Arrow circle o left","Compass 3","Point up","Point right","Point down","Point left"],"Material Icons: Action":[" 3","Accessible","Account balance","Account balance wallet","Account box","Account circle","Alarm add","Add shopping cart","Alarm off","Alarm on","All out","Announcement","Aspect ratio","Assignment ind","Assignment late","Assignment return","Assignment returned","Assignment turned in","Autorenew","Class","Turned in","Turned in not","Bug report","Build","Cached","Card membership","Card travel","Check circle","Chrome reader mode","Compare arrows","Payment","Delete","Delete forever","Description","Dns","Done","Done all","Donut large","Donut small","Euro symbol","Event seat","Exit to app","Explore","Extension","Face","Favorite","Get app","Find in page","Find replace","Fingerprint","Flight land","Flight takeoff","Flip to back","Flip to front","Question answer","Gif","Group work","Help","Help outline","Highlight off","Restore","Hourglass empty","Hourglass full","Http","Important devices","Info outline","Invert colors","Label","Label outline","Open in new","Lightbulb outline","Line style","Line weight","Shopping cart","Theaters","Room","Lock open","Lock outline","Loyalty","Markunread mailbox","Note add","Offline pin","Open in browser","Open with","Pageview","Pan tool","Perm camera mic","Perm contact calendar","Perm device information","Perm media","Perm phone msg","Perm scan wifi","Pets","Picture in picture","Picture in picture alt","Polymer","Power settings new","Pregnant woman","Receipt","Record voice over","Visibility","Remove shopping cart","Restore page","Rounded corner","Rowing","Settings applications","Settings backup restore","Settings bluetooth","Settings brightness","Settings cell","Settings ethernet","Settings input composite","Settings input hdmi","Settings input svideo","Settings overscan","Settings phone","Settings power","Settings remote","Shop","Shop two","Shopping basket","Speaker notes","Speaker notes off","Spellcheck","Subject","Supervisor account","Swap horiz","Swap vert","System update alt","Thumb down","Thumb up","Thumbs up down","Timeline","Toc","Today","Toll","Track changes","Translate","Trending down","Trending flat","Trending up","Update","View agenda","View array","View carousel","View column","View day","View headline","View list","View module","View stream","View week","Visibility off","Watch later","Work","Youtube searched for","Zoom in","Zoom out","Search","Star","Home","Lock","Book","Print","Gavel","Dashboard","Code","Info","Android","Language","Copyright","Motorcycle","Accessibility","Tab","Settings"],"Material Icons: Alert":["Add alert","Error","Error outline"],"Material Icons: AV":["Queue","Add to queue","Airplay","Album","Art track","Av timer","Branding watermark","Call to action","Closed caption","Not interested","Explicit","Fast forward","Fast rewind","Featured play list","Featured video","Fiber manual record","Forward  10","Forward  30","Forward  5","Games","Hd","Hearing","High quality","Mic","Mic none","Mic off","Music video","New releases","Note","Pause circle filled","Pause circle outline","Play arrow","Play circle outline","Playlist add","Playlist add check","Playlist play","Queue music","Queue play next","Radio","Recent actors","Remove from queue","Repeat one","Replay","Replay  10","Replay  30","Replay  5","Skip next","Skip previous","Slow motion video","Snooze","Sort by alpha","Subscriptions","Subtitles","Surround sound","Video call","Video label","Video library","Videocam","Videocam off","Volume down","Volume mute","Volume off","Volume up","Web","Web asset","Repeat","Pause","Stop","Equalizer","Loop","Shuffle"],"Material Icons: Communication":["Call end","Call made","Call missed","Call missed outgoing","Call received","Call split","Chat","Chat bubble","Chat bubble outline","Clear all","Contact mail","Contact phone","Contacts","Dialer sip","Dialpad","Import contacts","Import export","Invert colors off","Live help","Location off","Mail outline","Message","Phonelink erase","Phonelink lock","Phonelink ring","Phonelink setup","Portable wifi off","Present to all","Ring volume","Rss feed","Screen share","Stay primary portrait","Textsms","Stay primary landscape","Stop screen share","Swap calls","Voicemail","Vpn key","Comment","Phone"],"Material Icons: Content":["Add","Add box","Add circle","Backspace","Block","Content copy","Content cut","Content paste","Delete sweep","Remove circle","Drafts","Markunread","Filter list","Font download","Gesture","Low priority","Move to inbox","Next week","Remove circle outline","Reply all","Report","Select all","Text format","Unarchive","Weekend","Inbox","Flag","Forward","Sort","Archive","Undo","Redo","Reply","Remove","Link","Mail"],"Material Icons: Device":["Access alarms","Airplanemode inactive","Battery charging full","Battery std","Battery unknown","Bluetooth searching","Bluetooth connected","Bluetooth disabled","Brightness low","Brightness medium","Brightness high","Brightness auto","Data usage","Developer mode","Dvr","Location searching","Location disabled","Graphic eq","Network cell","Network wifi","Nfc","Signal cellular no sim","Screen lock landscape","Screen lock portrait","Screen lock rotation","Screen rotation","Sd storage","Settings system daydream","Signal cellular  4","Signal cellular connected no internet  4","Signal cellular null","Signal cellular off","Signal wifi  4","Signal wifi  4","Signal wifi off","Wallpaper","Wifi lock","Wifi tethering","Usb","Bluetooth","Storage"],"Material Icons: Editor":["Attach file","Attach money","Border all","Border bottom","Border clear","Border color","Border horizontal","Border inner","Border left","Border outer","Border right","Border style","Border top","Border vertical","Bubble chart","Merge type","Mode edit","Drag handle","Insert invitation","Format align center","Format align justify","Format align left","Format align right","Format bold","Format clear","Format color fill","Format color reset","Format color text","Format indent decrease","Format indent increase","Format italic","Format line spacing","Format list bulleted","Format list numbered","Format paint","Format quote","Format shapes","Format size","Format strikethrough","Format textdirection l to r","Format textdirection r to l","Functions","Highlight","Insert comment","Insert drive file","Linear scale","Mode comment","Monetization on","Money off","Multiline chart","Pie chart","Publish","Short text","Show chart","Space bar","Strikethrough s","Text fields","Title","Vertical align bottom","Vertical align center","Vertical align top","Wrap text"],"Material Icons: File":["Cloud upload","Cloud circle","Cloud done","Cloud download","Cloud off","Cloud queue","Create new folder","File upload","Folder open","Folder shared","Folder","Cloud","Attachment"],"Material Icons: Hardware":["Cast","Cast connected","Desktop mac","Desktop windows","Device hub","Phonelink","Devices other","Dock","Headset","Headset mic","Keyboard arrow down","Keyboard arrow left","Keyboard arrow right","Keyboard arrow up","Keyboard backspace","Keyboard capslock","Keyboard hide","Keyboard return","Keyboard tab","Keyboard voice","Laptop chromebook","Laptop mac","Laptop windows","Memory","Mouse","Phone android","Phone iphone","Phonelink off","Power input","Router","Scanner","Security","Sim card","Speaker","Speaker group","Tablet android","Tablet mac","Toys","Watch","Laptop","Tablet","Gamepad","Keyboard","Tv"],"Material Icons: Image":["Add a photo","Control point","Audiotrack","Blur circular","Blur linear","Blur off","Blur on","Brightness  1","Brightness  2","Brightness  3","Brightness  4","Broken image","Brush","Burst mode","Photo camera","Camera front","Camera rear","Camera roll","Center focus strong","Center focus weak","Navigate before","Navigate next","Wb cloudy","Photo library","Collections bookmark","Palette","Colorize","Compare","Control point duplicate","Crop  16","Crop  3","Crop landscape","Crop  7","Crop din","Crop free","Crop original","Crop portrait","Crop rotate","Crop square","Dehaze","Details","Exposure","Exposure neg  1","Exposure neg  2","Exposure plus  1","Exposure plus  2","Exposure zero","Filter  1","Filter  2","Filter  3","Filter  4","Filter  5","Filter  6","Filter  7","Filter  8","Filter  9","Filter  9","Filter b and w","Filter center focus","Filter drama","Filter frames","Filter none","Filter tilt shift","Filter vintage","Flare","Flash auto","Flash off","Flash on","Gradient","Grain","Grid off","Grid on","Hdr off","Hdr on","Hdr strong","Hdr weak","Healing","Image aspect ratio","Tag faces","Iso","Leak add","Leak remove","Lens","Linked camera","Looks","Looks  3","Looks  4","Looks  5","Looks  6","Looks one","Looks two","Loupe","Monochrome photos","Movie creation","Movie filter","Music note","Nature","Nature people","Panorama","Panorama horizontal","Panorama vertical","Panorama wide angle","Photo album","Photo filter","Photo size select actual","Photo size select large","Photo size select small","Picture as pdf","Portrait","Rotate  90","Rotate left","Rotate right","Slideshow","Straighten","Style","Switch camera","Switch video","Texture","Timelapse","Timer","Timer  10","Timer  3","Timer off","Tonality","Transform","Tune","View comfy","View compact","Vignette","Wb auto","Wb incandescent","Wb sunny","Camera","Adjust","Edit","Filter","Crop","Image","Flip"],"Material Icons: Maps":["Add location","Flight","Beenhere","Directions","Directions bike","Directions bus","Directions car","Directions transit","Directions walk","Edit location","Ev station","Terrain","My location","Local hotel","Layers","Layers clear","Local play","Local airport","Local atm","Local bar","Local cafe","Local car wash","Local convenience store","Restaurant menu","Local drink","Local florist","Local gas station","Local hospital","Local laundry service","Local library","Local mall","Local offer","Local parking","Local pharmacy","Local pizza","Local shipping","Local taxi","Navigation","Near me","Person pin","Person pin circle","Pin drop","Rate review","Restaurant","Satellite","Store mall directory","Streetview","Traffic","Tram","Transfer within a station","Zoom out map","Train","Subway","Map"],"Material Icons: Navigation":["Adb","Airline seat flat","Airline seat individual suite","Airline seat legroom extra","Airline seat legroom normal","Airline seat legroom reduced","Airline seat recline extra","Airline seat recline normal","Apps","Arrow back","Arrow downward","Arrow drop down","Arrow drop down circle","Arrow drop up","Arrow forward","Cancel","Confirmation number","Disc full","Do not disturb alt","Do not disturb off","Time to leave","Enhanced encryption","Event available","Event busy","Event note","Expand less","Expand more","Sms failed","First page","Folder special","Fullscreen","Fullscreen exit","Last page","Live tv","Sync","Mms","More","More horiz","More vert","Network check","Network locked","No encryption","Ondemand video","Personal video","Phone bluetooth speaker","Phone forwarded","Phone in talk","Phone locked","Phone missed","Phone paused","Power","Priority high","Sim card alert","Subdirectory arrow left","Subdirectory arrow right","Sync disabled","Sync problem","System update","Tap and play","Vibration","Voice chat","Vpn lock","Wc","Check","Refresh","Wifi","Menu","Close"],"Material Icons: Places":["Ac unit","Airport shuttle","All inclusive","Beach access","Business center","Casino","Child care","Fitness center","Free breakfast","Golf course","Hot tub","Kitchen","Pool","Room service","Rv hookup","Smoke free","Spa"],"Material Icons: Social":["Poll","Domain","Cake","People","Group add","Location city","Mood bad","Notifications","Notifications active","Notifications none","Notifications off","Notifications paused","Pages","Party mode","People outline","Person outline","Person","Person add","Plus one","Public","School","Sentiment dissatisfied","Sentiment neutral","Sentiment satisfied","Sentiment very dissatisfied","Sentiment very satisfied","Whatshot","Group","Share"],"Material Icons: Toggle":["Check box","Check box outline blank","Indeterminate check box","Radio button unchecked","Radio button checked","Star border","Star half"],"Other Icons":["Alarm 3","Schedule","Accessibility 2","Adjust 2","Airline seat flat angled","Archive 2","Assignment","Assistant","Battery alert","Bluetooth 2","Camera 4","Camera enhance","Redeem","Child friendly","Close 3","Laptop 3","Copyright 2","Crop 3","Dashboard 3","Date range","Developer board","Directions boat","Directions railway","Directions run","Eject 3","Favorite border","Fiber dvr","Fiber new","Fiber smart record","Format underlined","G translate","Gavel 2","Goat","Inbox 2","Input","Language 2","Motorcycle 2","Opacity","Perm data setting","Refresh 2","Reorder 2","Repeat 2","Reply 3","Send 2","Shuffle 2","Smoking rooms","Sort 2","Stars","Storage 2","Subway 2","Swap vertical circle","Tab unselected","Touch app","Train 2","Tv 3","Unfold less","Unfold more","Usb 2","Videogame asset","View quilt","Wb iridescent","Widgets","Wifi 2","Glass","Power off","Signal","Headphones","Text height","Text width","Tint","Arrows","Step backward","Fast backward","Backward","Eject","Chevron left","Chevron right","Plus circle","Minus circle","Times circle","Crosshairs","Times circle o","Ban","Compress","Minus","Asterisk","Exclamation circle","Gift","Random","Chevron up","Chevron down","Retweet","Arrows v","Arrows h","Camera retro","Sign out","Sign in","Trophy","Lemon o","Square o","Hdd o","Bullhorn","Bell o","Certificate","Hand o right","Hand o left","Hand o up","Hand o down","Tasks","Briefcase","Arrows alt","Flask","Square","Magic","Caret down","Caret up","Caret left","Caret right","Columns","Sort desc","Sort asc","Bolt","Sitemap","Umbrella","Lightbulb o","Exchange","Stethoscope","Suitcase","Bell","Cutlery","Building o","Hospital o","Ambulance","Medkit","Beer","H square","Plus square","Angle double left","Angle double right","Angle double up","Angle double down","Angle left","Angle right","Angle up","Angle down","Mobile 3","Circle o","Circle","Mail reply","Terminal","Mail reply all","Exclamation","Superscript","Subscript","Eraser","Puzzle piece","Microphone","Microphone slash","Shield","Rocket","Maxcdn","Chevron circle left","Chevron circle right","Chevron circle up","Chevron circle down","Bullseye","Ellipsis h","Ellipsis v","Rss square","Minus square","Minus square o","Level up","Level down","Compass 2","Caret square o down","Caret square o up","Caret square o right","Sort alpha asc","Sort alpha desc","Sort amount asc","Sort amount desc","Sort numeric asc","Sort numeric desc","Youtube square","Youtube","Xing","Xing square","Dropbox","Stack overflow","Instagram","Flickr","Adn","Bitbucket","Bitbucket square","Dribbble","Foursquare","Trello","Female","Male","Gittip","Bug","Vk","Weibo","Renren","Pagelines","Stack exchange","Caret square o left","Dot circle o","Wheelchair","Plus square o","Space shuttle","Slack","Openid","Bank","Graduation cap","Delicious 2","Digg","Pied piper","Pied piper alt","Drupal","Fax","Building","Child","Paw","Spoon","Cube","Cubes","Behance","Behance square","Steam 3","Steam square","Recycle","Tree 2","Spotify","Deviantart 3","Database","Vine","Codepen","Jsfiddle","Circle o notch","Git square","Hacker news","Tencent weibo","Qq","Wechat","Circle thin","Header","Paragraph","Sliders","Bomb","Futbol o","Tty","Binoculars 2","Plug","Slideshare","Twitch","Google wallet","Cc visa","Cc mastercard","Cc discover","Cc amex","Cc stripe","Bell slash","Bell slash o","Eyedropper","Birthday cake","Toggle off","Toggle on","Bicycle","Ioxhost","Angellist","Cc","Ils","Meanpath","Buysellads","Connectdevelop","Dashcube","Forumbee","Leanpub","Sellsy","Shirtsinbulk","Simplybuilt","Skyatlas","Diamond","Ship","Street view","Heartbeat","Venus","Mars","Mercury","Intersex","Transgender alt","Venus double","Mars double","Venus mars","Mars stroke","Mars stroke v","Mars stroke h","Neuter","Genderless","Whatsapp","Server","Viacoin","Medium","Y combinator","Optin monster","Opencart","Expeditedssl","Battery  4","Battery  3","Battery  2","Battery  1","Battery  0","I cursor","Object ungroup","Sticky note","Sticky note o","Cc jcb","Cc diners club","Clone","Balance scale","Hourglass o","Hourglass  1","Hourglass  2","Hourglass  3","Hourglass","Hand grab o","Hand paper o","Hand lizard o","Hand spock o","Hand pointer o","Hand peace o","Trademark","Registered","Creative commons","Gg","Gg circle","Tripadvisor","Odnoklassniki","Odnoklassniki square","Get pocket","Wikipedia w","Contao"," 500","Amazon","Industry","Commenting","Commenting o","Houzz","Black tie","Fonticons","Edge","Codiepie","Modx","Fort awesome","Product hunt","Mixcloud","Scribd","Stop circle","Stop circle o","Shopping bag","Shopping basket","Hashtag","Bluetooth b","Percent","Gitlab","Wpbeginner","Wpforms","Envira","Universal access","Wheelchair alt","Blind","Audio description","Braille","Assistive listening systems","American sign language interpreting","Deaf","Glide","Glide g","Sign language","Low vision","Viadeo","Viadeo square","Snapchat","Snapchat ghost","Snapchat square","Thermometer","None","Celsius","Fahrenheit","Droplet","Pacman","Spades","Clubs","Diamonds","Pawn","Bell 2","Quotes left","Wand","Aid","Bug 2","Meter 2","Dashboard 2","Shield 2","Powercord","Tree","Minus 2","Checkbox unchecked","Checkbox partial","Console","Lanyrd","IcoMoon","Meter"]},
			sourceClass = {"Web Applications":["ipt-icomoon-attachment2","ipt-icomoon-code3","ipt-icomoon-fiber_pin","ipt-icomoon-list4","ipt-icomoon-menu3","ipt-icomoon-remove4","ipt-icomoon-search3","ipt-icomoon-settings2","ipt-icomoon-settings_input_antenna","ipt-icomoon-settings_voice","ipt-icomoon-th-list","ipt-icomoon-close2","ipt-icomoon-search-plus","ipt-icomoon-search-minus","ipt-icomoon-download","ipt-icomoon-list-alt","ipt-icomoon-bookmark","ipt-icomoon-list","ipt-icomoon-upload","ipt-icomoon-bookmark-o","ipt-icomoon-feed5","ipt-icomoon-globe","ipt-icomoon-list-ul","ipt-icomoon-list-ol","ipt-icomoon-cloud-download","ipt-icomoon-cloud-upload","ipt-icomoon-quote-left","ipt-icomoon-quote-right","ipt-icomoon-code-fork","ipt-icomoon-file-code-o","ipt-icomoon-at","ipt-icomoon-bed","ipt-icomoon-map-pin","ipt-icomoon-lines","ipt-icomoon-connection","ipt-icomoon-feed","ipt-icomoon-book2","ipt-icomoon-address-book","ipt-icomoon-notebook","ipt-icomoon-pushpin","ipt-icomoon-box-add","ipt-icomoon-box-remove","ipt-icomoon-download2","ipt-icomoon-upload2","ipt-icomoon-binoculars","ipt-icomoon-search2","ipt-icomoon-gift2","ipt-icomoon-remove2","ipt-icomoon-list2","ipt-icomoon-cloud-download2","ipt-icomoon-cloud-upload2","ipt-icomoon-download3","ipt-icomoon-upload3","ipt-icomoon-download4","ipt-icomoon-upload4","ipt-icomoon-globe2","ipt-icomoon-earth","ipt-icomoon-bookmark2","ipt-icomoon-bookmarks","ipt-icomoon-thumbs-up2","ipt-icomoon-thumbs-up3","ipt-icomoon-cancel-circle","ipt-icomoon-arrow-up-left","ipt-icomoon-arrow-up2","ipt-icomoon-arrow-up-right","ipt-icomoon-arrow-down-right","ipt-icomoon-arrow-down2","ipt-icomoon-arrow-down-left","ipt-icomoon-arrow-up-left2","ipt-icomoon-arrow-up3","ipt-icomoon-arrow-up-right2","ipt-icomoon-arrow-down-right2","ipt-icomoon-arrow-down3","ipt-icomoon-arrow-down-left2","ipt-icomoon-arrow-up-left3","ipt-icomoon-arrow-up4","ipt-icomoon-arrow-up-right3","ipt-icomoon-arrow-down-right3","ipt-icomoon-arrow-down4","ipt-icomoon-arrow-down-left3","ipt-icomoon-feed2","ipt-icomoon-feed3","ipt-icomoon-list3","ipt-icomoon-numbered-list","ipt-icomoon-menu2","ipt-icomoon-code2","ipt-icomoon-embed","ipt-icomoon-feed4"],"Spinners":["ipt-icomoon-spinner","ipt-icomoon-bus","ipt-icomoon-busy","ipt-icomoon-spinner2","ipt-icomoon-spinner3","ipt-icomoon-spinner4","ipt-icomoon-spinner5","ipt-icomoon-spinner6","ipt-icomoon-spinner7"],"Business Icons":["ipt-icomoon-comment2","ipt-icomoon-library_books","ipt-icomoon-library_music","ipt-icomoon-play_for_work","ipt-icomoon-verified_user","ipt-icomoon-user","ipt-icomoon-comments","ipt-icomoon-comment-o","ipt-icomoon-comments-o","ipt-icomoon-user-md","ipt-icomoon-file","ipt-icomoon-life-bouy","ipt-icomoon-ra","ipt-icomoon-newspaper-o","ipt-icomoon-user-secret","ipt-icomoon-user-plus","ipt-icomoon-user-times","ipt-icomoon-object-group","ipt-icomoon-office","ipt-icomoon-newspaper","ipt-icomoon-bullhorn2","ipt-icomoon-books","ipt-icomoon-library","ipt-icomoon-file2","ipt-icomoon-file3","ipt-icomoon-support","ipt-icomoon-phone-hang-up","ipt-icomoon-bubbles","ipt-icomoon-bubbles2","ipt-icomoon-bubble","ipt-icomoon-bubbles3","ipt-icomoon-bubbles4","ipt-icomoon-users","ipt-icomoon-user2","ipt-icomoon-users2","ipt-icomoon-user3","ipt-icomoon-user4","ipt-icomoon-lab","ipt-icomoon-briefcase2","ipt-icomoon-signup","ipt-icomoon-libreoffice","ipt-icomoon-file-openoffice","ipt-icomoon-file-xml","ipt-icomoon-file-css","ipt-icomoon-profile","ipt-icomoon-file4","ipt-icomoon-file5","ipt-icomoon-bubble2","ipt-icomoon-user5","ipt-icomoon-file-word","ipt-icomoon-file-excel"],"eCommerce":["ipt-icomoon-tag","ipt-icomoon-tags","ipt-icomoon-shopping-cart","ipt-icomoon-credit-card","ipt-icomoon-automobile","ipt-icomoon-calculator","ipt-icomoon-cart-plus","ipt-icomoon-cart-arrow-down","ipt-icomoon-credit-card-alt","ipt-icomoon-tag2","ipt-icomoon-tags2","ipt-icomoon-cart","ipt-icomoon-cart2","ipt-icomoon-credit","ipt-icomoon-calculate","ipt-icomoon-cart3"],"Currency Icons":["ipt-icomoon-money","ipt-icomoon-eur","ipt-icomoon-gbp","ipt-icomoon-dollar","ipt-icomoon-inr","ipt-icomoon-cny","ipt-icomoon-rouble","ipt-icomoon-krw","ipt-icomoon-bitcoin","ipt-icomoon-try","ipt-icomoon-coin"],"Form Control Icons":["ipt-icomoon-check2","ipt-icomoon-save2","ipt-icomoon-trash-o","ipt-icomoon-check-square-o","ipt-icomoon-check-circle","ipt-icomoon-check-circle-o","ipt-icomoon-cut","ipt-icomoon-copy","ipt-icomoon-floppy-o","ipt-icomoon-check-square","ipt-icomoon-trash","ipt-icomoon-calendar-check-o","ipt-icomoon-podcast","ipt-icomoon-copy2","ipt-icomoon-copy3","ipt-icomoon-paste2","ipt-icomoon-paste3","ipt-icomoon-paste4","ipt-icomoon-spell-check","ipt-icomoon-enter","ipt-icomoon-exit","ipt-icomoon-crop2","ipt-icomoon-copy4","ipt-icomoon-disk","ipt-icomoon-radio-checked","ipt-icomoon-radio-unchecked"],"User Action & Text Editor":["ipt-icomoon-flip3","ipt-icomoon-link3","ipt-icomoon-redo3","ipt-icomoon-tab2","ipt-icomoon-undo4","ipt-icomoon-th-large","ipt-icomoon-th","ipt-icomoon-font","ipt-icomoon-bold","ipt-icomoon-italic","ipt-icomoon-align-left","ipt-icomoon-align-center","ipt-icomoon-align-right","ipt-icomoon-align-justify","ipt-icomoon-dedent","ipt-icomoon-indent","ipt-icomoon-expand","ipt-icomoon-external-link","ipt-icomoon-chain","ipt-icomoon-paperclip","ipt-icomoon-strikethrough","ipt-icomoon-underline","ipt-icomoon-table","ipt-icomoon-rotate-left","ipt-icomoon-clipboard","ipt-icomoon-chain-broken","ipt-icomoon-anchor","ipt-icomoon-external-link-square","ipt-icomoon-hand-scissors-o","ipt-icomoon-flip2","ipt-icomoon-undo2","ipt-icomoon-redo2","ipt-icomoon-zoomin","ipt-icomoon-zoomout","ipt-icomoon-contract","ipt-icomoon-expand2","ipt-icomoon-contract2","ipt-icomoon-scissors","ipt-icomoon-font2","ipt-icomoon-text-height2","ipt-icomoon-text-width2","ipt-icomoon-bold2","ipt-icomoon-underline2","ipt-icomoon-italic2","ipt-icomoon-strikethrough2","ipt-icomoon-omega","ipt-icomoon-sigma","ipt-icomoon-table2","ipt-icomoon-pilcrow","ipt-icomoon-lefttoright","ipt-icomoon-righttoleft","ipt-icomoon-expand3","ipt-icomoon-table3","ipt-icomoon-insert-template","ipt-icomoon-newtab","ipt-icomoon-indent-decrease","ipt-icomoon-indent-increase","ipt-icomoon-paragraph-justify","ipt-icomoon-paragraph-center","ipt-icomoon-paragraph-left","ipt-icomoon-paragraph-justify2","ipt-icomoon-paragraph-center2","ipt-icomoon-paragraph-left2"],"Charts and Codes":["ipt-icomoon-pie_chart_outlined","ipt-icomoon-qrcode","ipt-icomoon-barcode","ipt-icomoon-bar-chart","ipt-icomoon-bars","ipt-icomoon-area-chart","ipt-icomoon-pie-chart","ipt-icomoon-line-chart","ipt-icomoon-barcode2","ipt-icomoon-qrcode2","ipt-icomoon-pie","ipt-icomoon-stats","ipt-icomoon-bars2","ipt-icomoon-bars3"],"Attentive":["ipt-icomoon-lock4","ipt-icomoon-info4","ipt-icomoon-warning3","ipt-icomoon-question-circle","ipt-icomoon-info-circle","ipt-icomoon-exclamation-triangle","ipt-icomoon-question","ipt-icomoon-question-circle-o","ipt-icomoon-lock2","ipt-icomoon-lock3","ipt-icomoon-warning2","ipt-icomoon-notification","ipt-icomoon-question2","ipt-icomoon-info2","ipt-icomoon-info3","ipt-icomoon-blocked","ipt-icomoon-spam"],"Multimedia Icons":["ipt-icomoon-equalizer2","ipt-icomoon-forward5","ipt-icomoon-photo2","ipt-icomoon-pause4","ipt-icomoon-play_circle_filled","ipt-icomoon-music","ipt-icomoon-film","ipt-icomoon-play-circle-o","ipt-icomoon-volume-off","ipt-icomoon-volume-down","ipt-icomoon-volume-up","ipt-icomoon-video-camera","ipt-icomoon-image3","ipt-icomoon-play","ipt-icomoon-fast-forward","ipt-icomoon-step-forward","ipt-icomoon-play-circle","ipt-icomoon-youtube-play","ipt-icomoon-file-image-o","ipt-icomoon-empire","ipt-icomoon-pause-circle","ipt-icomoon-pause-circle-o","ipt-icomoon-volume-control-phone","ipt-icomoon-wind","ipt-icomoon-headphones2","ipt-icomoon-play2","ipt-icomoon-camera2","ipt-icomoon-forward2","ipt-icomoon-brightness-contrast","ipt-icomoon-contrast","ipt-icomoon-play3","ipt-icomoon-pause2","ipt-icomoon-backward2","ipt-icomoon-forward3","ipt-icomoon-play4","ipt-icomoon-pause3","ipt-icomoon-backward3","ipt-icomoon-forward4","ipt-icomoon-first","ipt-icomoon-previous","ipt-icomoon-next","ipt-icomoon-eject2","ipt-icomoon-volume-high","ipt-icomoon-volume-medium","ipt-icomoon-volume-low","ipt-icomoon-volume-mute","ipt-icomoon-volume-mute2","ipt-icomoon-volume-increase","ipt-icomoon-volume-decrease","ipt-icomoon-loop2","ipt-icomoon-loop3","ipt-icomoon-arrow-right2","ipt-icomoon-arrow-left2","ipt-icomoon-arrow-right3","ipt-icomoon-arrow-left3","ipt-icomoon-arrow-right4","ipt-icomoon-arrow-left4","ipt-icomoon-image2","ipt-icomoon-images","ipt-icomoon-camera3","ipt-icomoon-film2","ipt-icomoon-music2","ipt-icomoon-paragraph-right","ipt-icomoon-paragraph-right2","ipt-icomoon-windows8"],"Location and Contact":["ipt-icomoon-flag3","ipt-icomoon-phone3","ipt-icomoon-home5","ipt-icomoon-map4","ipt-icomoon-speaker_phone","ipt-icomoon-envelope-o","ipt-icomoon-map-marker","ipt-icomoon-phone-square","ipt-icomoon-envelope","ipt-icomoon-flag-o","ipt-icomoon-flag-checkered","ipt-icomoon-location-arrow","ipt-icomoon-envelope-square","ipt-icomoon-map-signs","ipt-icomoon-map-o","ipt-icomoon-map3","ipt-icomoon-compass","ipt-icomoon-home2","ipt-icomoon-home3","ipt-icomoon-home4","ipt-icomoon-phone2","ipt-icomoon-envelop","ipt-icomoon-location","ipt-icomoon-location2","ipt-icomoon-map2","ipt-icomoon-mobile","ipt-icomoon-target","ipt-icomoon-flag2","ipt-icomoon-mail2","ipt-icomoon-mobile2","ipt-icomoon-mail3","ipt-icomoon-mail4"],"Date and Time":["ipt-icomoon-change_history","ipt-icomoon-stop4","ipt-icomoon-clock-o","ipt-icomoon-calendar","ipt-icomoon-calendar-o","ipt-icomoon-history2","ipt-icomoon-calendar-plus-o","ipt-icomoon-calendar-minus-o","ipt-icomoon-calendar-times-o","ipt-icomoon-history","ipt-icomoon-clock","ipt-icomoon-clock2","ipt-icomoon-alarm","ipt-icomoon-alarm2","ipt-icomoon-stopwatch","ipt-icomoon-calendar2","ipt-icomoon-calendar3","ipt-icomoon-stop2","ipt-icomoon-stop3"],"Devices":["ipt-icomoon-keyboard2","ipt-icomoon-print3","ipt-icomoon-tablet3","ipt-icomoon-key","ipt-icomoon-desktop","ipt-icomoon-keyboard-o","ipt-icomoon-mouse-pointer","ipt-icomoon-television","ipt-icomoon-print2","ipt-icomoon-laptop2","ipt-icomoon-key2","ipt-icomoon-key3","ipt-icomoon-eye-blocked","ipt-icomoon-screen","ipt-icomoon-tablet2"],"Tools":["ipt-icomoon-filter4","ipt-icomoon-cog3","ipt-icomoon-pencil","ipt-icomoon-magnet","ipt-icomoon-cogs2","ipt-icomoon-unlock","ipt-icomoon-wrench","ipt-icomoon-unlock-alt","ipt-icomoon-pencil-square","ipt-icomoon-paint-brush","ipt-icomoon-pencil2","ipt-icomoon-quill","ipt-icomoon-pen","ipt-icomoon-blog","ipt-icomoon-paint-format","ipt-icomoon-dice","ipt-icomoon-unlocked","ipt-icomoon-wrench2","ipt-icomoon-cogs","ipt-icomoon-cog","ipt-icomoon-hammer","ipt-icomoon-hammer2","ipt-icomoon-magnet2","ipt-icomoon-filter2","ipt-icomoon-filter3","ipt-icomoon-pencil3","ipt-icomoon-cog2"],"Social Networking":["ipt-icomoon-share3","ipt-icomoon-share-square-o","ipt-icomoon-mail-forward","ipt-icomoon-plus","ipt-icomoon-twitter-square","ipt-icomoon-facebook-square","ipt-icomoon-linkedin-square","ipt-icomoon-github-square","ipt-icomoon-twitter","ipt-icomoon-facebook","ipt-icomoon-github","ipt-icomoon-cloud6","ipt-icomoon-pinterest","ipt-icomoon-pinterest-square","ipt-icomoon-google-plus-square","ipt-icomoon-google-plus","ipt-icomoon-linkedin","ipt-icomoon-github-alt","ipt-icomoon-share-square","ipt-icomoon-tumblr","ipt-icomoon-tumblr-square","ipt-icomoon-vimeo-square","ipt-icomoon-wordpress3","ipt-icomoon-yahoo2","ipt-icomoon-google2","ipt-icomoon-reddit2","ipt-icomoon-reddit-square","ipt-icomoon-stumbleupon-circle","ipt-icomoon-stumbleupon3","ipt-icomoon-soundcloud3","ipt-icomoon-git","ipt-icomoon-share-alt","ipt-icomoon-share-alt-square","ipt-icomoon-yelp2","ipt-icomoon-lastfm3","ipt-icomoon-lastfm-square","ipt-icomoon-facebook-official","ipt-icomoon-pinterest-p","ipt-icomoon-vimeo3","ipt-icomoon-reddit-alien","ipt-icomoon-cloud2","ipt-icomoon-cloud3","ipt-icomoon-cloud4","ipt-icomoon-cloud5","ipt-icomoon-stack","ipt-icomoon-cloud7","ipt-icomoon-plus2","ipt-icomoon-last","ipt-icomoon-google","ipt-icomoon-googleplus","ipt-icomoon-googleplus2","ipt-icomoon-googleplus3","ipt-icomoon-google-drive","ipt-icomoon-facebook2","ipt-icomoon-facebook3","ipt-icomoon-instagram2","ipt-icomoon-twitter2","ipt-icomoon-twitter3","ipt-icomoon-youtube2","ipt-icomoon-vimeo","ipt-icomoon-vimeo2","ipt-icomoon-flickr2","ipt-icomoon-flickr3","ipt-icomoon-flickr4","ipt-icomoon-picassa","ipt-icomoon-dribbble2","ipt-icomoon-dribbble3","ipt-icomoon-dribbble4","ipt-icomoon-forrst","ipt-icomoon-forrst2","ipt-icomoon-deviantart","ipt-icomoon-deviantart2","ipt-icomoon-steam","ipt-icomoon-github2","ipt-icomoon-github3","ipt-icomoon-github4","ipt-icomoon-github5","ipt-icomoon-wordpress","ipt-icomoon-blogger","ipt-icomoon-tumblr2","ipt-icomoon-tumblr3","ipt-icomoon-yahoo","ipt-icomoon-soundcloud","ipt-icomoon-soundcloud2","ipt-icomoon-reddit","ipt-icomoon-lastfm","ipt-icomoon-stumbleupon","ipt-icomoon-stackoverflow","ipt-icomoon-pinterest2","ipt-icomoon-xing2","ipt-icomoon-xing3","ipt-icomoon-foursquare2","ipt-icomoon-foursquare3","ipt-icomoon-yelp","ipt-icomoon-twitter4","ipt-icomoon-youtube3","ipt-icomoon-vimeo22","ipt-icomoon-flickr5","ipt-icomoon-facebook4","ipt-icomoon-googleplus4","ipt-icomoon-picassa2","ipt-icomoon-wordpress2","ipt-icomoon-github6","ipt-icomoon-steam2","ipt-icomoon-blogger2","ipt-icomoon-linkedin2","ipt-icomoon-flattr","ipt-icomoon-pinterest3","ipt-icomoon-stumbleupon2","ipt-icomoon-delicious","ipt-icomoon-lastfm2"],"Brands Icons":["ipt-icomoon-android3","ipt-icomoon-fire","ipt-icomoon-html5","ipt-icomoon-css3","ipt-icomoon-apple","ipt-icomoon-windows","ipt-icomoon-linux","ipt-icomoon-skype","ipt-icomoon-joomla2","ipt-icomoon-paypal4","ipt-icomoon-cc-paypal","ipt-icomoon-safari2","ipt-icomoon-chrome2","ipt-icomoon-firefox2","ipt-icomoon-opera2","ipt-icomoon-internet-explorer","ipt-icomoon-folder-open2","ipt-icomoon-fire2","ipt-icomoon-joomla","ipt-icomoon-tux","ipt-icomoon-finder","ipt-icomoon-windows2","ipt-icomoon-paypal","ipt-icomoon-paypal2","ipt-icomoon-html52","ipt-icomoon-css32","ipt-icomoon-apple2","ipt-icomoon-android2","ipt-icomoon-skype2","ipt-icomoon-paypal3","ipt-icomoon-html53","ipt-icomoon-chrome","ipt-icomoon-firefox","ipt-icomoon-IE","ipt-icomoon-safari","ipt-icomoon-opera"],"Files & Documents":["ipt-icomoon-folder3","ipt-icomoon-file-o","ipt-icomoon-folder-open","ipt-icomoon-file-text-o","ipt-icomoon-folder-o","ipt-icomoon-folder-open-o","ipt-icomoon-file-text","ipt-icomoon-cab","ipt-icomoon-file-pdf-o","ipt-icomoon-file-word-o","ipt-icomoon-file-excel-o","ipt-icomoon-file-powerpoint-o","ipt-icomoon-file-archive-o","ipt-icomoon-file-audio-o","ipt-icomoon-file-movie-o","ipt-icomoon-folder2","ipt-icomoon-drawer","ipt-icomoon-drawer2","ipt-icomoon-drawer3","ipt-icomoon-switch","ipt-icomoon-file-pdf","ipt-icomoon-file-zip","ipt-icomoon-file-powerpoint","ipt-icomoon-cabinet"],"Travel and Living":["ipt-icomoon-road","ipt-icomoon-plane","ipt-icomoon-truck","ipt-icomoon-coffee","ipt-icomoon-fighter-jet","ipt-icomoon-ticket","ipt-icomoon-paper-plane","ipt-icomoon-paper-plane-o","ipt-icomoon-ticket2","ipt-icomoon-trophy2","ipt-icomoon-glass2","ipt-icomoon-mug","ipt-icomoon-food","ipt-icomoon-rocket2","ipt-icomoon-airplane","ipt-icomoon-truck2","ipt-icomoon-road2","ipt-icomoon-checkmark-circle","ipt-icomoon-checkmark","ipt-icomoon-checkmark2","ipt-icomoon-checkbox-checked"],"Weather & Nature Icons":["ipt-icomoon-leaf","ipt-icomoon-fire-extinguisher","ipt-icomoon-sun-o","ipt-icomoon-moon-o","ipt-icomoon-sunrise","ipt-icomoon-sun","ipt-icomoon-moon","ipt-icomoon-sun2","ipt-icomoon-windy","ipt-icomoon-snowflake","ipt-icomoon-cloudy","ipt-icomoon-weather","ipt-icomoon-weather2","ipt-icomoon-weather3","ipt-icomoon-lightning","ipt-icomoon-lightning2","ipt-icomoon-rainy","ipt-icomoon-rainy2","ipt-icomoon-windy2","ipt-icomoon-windy3","ipt-icomoon-snowy","ipt-icomoon-snowy2","ipt-icomoon-snowy3","ipt-icomoon-weather4","ipt-icomoon-cloudy2","ipt-icomoon-lightning3","ipt-icomoon-sun3","ipt-icomoon-moon2","ipt-icomoon-cloudy3","ipt-icomoon-lightning4","ipt-icomoon-rainy3","ipt-icomoon-rainy4","ipt-icomoon-windy4","ipt-icomoon-windy5","ipt-icomoon-snowy4","ipt-icomoon-snowy5","ipt-icomoon-weather5","ipt-icomoon-cloudy4","ipt-icomoon-lightning5","ipt-icomoon-leaf2","ipt-icomoon-lightning6","ipt-icomoon-brightness-medium"],"Like & Dislike Icons":["ipt-icomoon-star5","ipt-icomoon-heart","ipt-icomoon-star-o","ipt-icomoon-eye","ipt-icomoon-eye-slash","ipt-icomoon-thumbs-o-up","ipt-icomoon-thumbs-o-down","ipt-icomoon-star-half","ipt-icomoon-heart-o","ipt-icomoon-thumb-tack","ipt-icomoon-star-half-empty","ipt-icomoon-thumbs-up","ipt-icomoon-thumbs-down","ipt-icomoon-eye2","ipt-icomoon-eye3","ipt-icomoon-star2","ipt-icomoon-star3","ipt-icomoon-star4","ipt-icomoon-heart2","ipt-icomoon-heart3","ipt-icomoon-heart-broken"],"Emoticons":["ipt-icomoon-smile-o","ipt-icomoon-frown-o","ipt-icomoon-meh-o","ipt-icomoon-happy","ipt-icomoon-happy2","ipt-icomoon-smiley","ipt-icomoon-smiley2","ipt-icomoon-tongue","ipt-icomoon-tongue2","ipt-icomoon-sad","ipt-icomoon-sad2","ipt-icomoon-wink","ipt-icomoon-wink2","ipt-icomoon-grin","ipt-icomoon-grin2","ipt-icomoon-cool","ipt-icomoon-cool2","ipt-icomoon-angry","ipt-icomoon-angry2","ipt-icomoon-evil","ipt-icomoon-evil2","ipt-icomoon-shocked","ipt-icomoon-shocked2","ipt-icomoon-confused","ipt-icomoon-confused2","ipt-icomoon-neutral","ipt-icomoon-neutral2","ipt-icomoon-wondering","ipt-icomoon-wondering2"],"Directional Icons":["ipt-icomoon-arrow_upward","ipt-icomoon-arrow-circle-o-down","ipt-icomoon-arrow-circle-o-up","ipt-icomoon-arrow-left","ipt-icomoon-arrow-right","ipt-icomoon-arrow-up","ipt-icomoon-arrow-down","ipt-icomoon-arrow-circle-left","ipt-icomoon-arrow-circle-right","ipt-icomoon-arrow-circle-up","ipt-icomoon-arrow-circle-down","ipt-icomoon-long-arrow-down","ipt-icomoon-long-arrow-up","ipt-icomoon-long-arrow-left","ipt-icomoon-long-arrow-right","ipt-icomoon-arrow-circle-o-right","ipt-icomoon-arrow-circle-o-left","ipt-icomoon-compass3","ipt-icomoon-point-up","ipt-icomoon-point-right","ipt-icomoon-point-down","ipt-icomoon-point-left"],"Material Icons: Action":["ipt-icomoon-3d_rotation","ipt-icomoon-accessible","ipt-icomoon-account_balance","ipt-icomoon-account_balance_wallet","ipt-icomoon-account_box","ipt-icomoon-account_circle","ipt-icomoon-alarm_add","ipt-icomoon-add_shopping_cart","ipt-icomoon-alarm_off","ipt-icomoon-alarm_on","ipt-icomoon-all_out","ipt-icomoon-announcement","ipt-icomoon-aspect_ratio","ipt-icomoon-assignment_ind","ipt-icomoon-assignment_late","ipt-icomoon-assignment_return","ipt-icomoon-assignment_returned","ipt-icomoon-assignment_turned_in","ipt-icomoon-autorenew","ipt-icomoon-class","ipt-icomoon-turned_in","ipt-icomoon-turned_in_not","ipt-icomoon-bug_report","ipt-icomoon-build","ipt-icomoon-cached","ipt-icomoon-card_membership","ipt-icomoon-card_travel","ipt-icomoon-check_circle","ipt-icomoon-chrome_reader_mode","ipt-icomoon-compare_arrows","ipt-icomoon-payment","ipt-icomoon-delete","ipt-icomoon-delete_forever","ipt-icomoon-description","ipt-icomoon-dns","ipt-icomoon-done","ipt-icomoon-done_all","ipt-icomoon-donut_large","ipt-icomoon-donut_small","ipt-icomoon-euro_symbol","ipt-icomoon-event_seat","ipt-icomoon-exit_to_app","ipt-icomoon-explore","ipt-icomoon-extension","ipt-icomoon-face","ipt-icomoon-favorite","ipt-icomoon-get_app","ipt-icomoon-find_in_page","ipt-icomoon-find_replace","ipt-icomoon-fingerprint","ipt-icomoon-flight_land","ipt-icomoon-flight_takeoff","ipt-icomoon-flip_to_back","ipt-icomoon-flip_to_front","ipt-icomoon-question_answer","ipt-icomoon-gif","ipt-icomoon-group_work","ipt-icomoon-help","ipt-icomoon-help_outline","ipt-icomoon-highlight_off","ipt-icomoon-restore","ipt-icomoon-hourglass_empty","ipt-icomoon-hourglass_full","ipt-icomoon-http","ipt-icomoon-important_devices","ipt-icomoon-info_outline","ipt-icomoon-invert_colors","ipt-icomoon-label","ipt-icomoon-label_outline","ipt-icomoon-open_in_new","ipt-icomoon-lightbulb_outline","ipt-icomoon-line_style","ipt-icomoon-line_weight","ipt-icomoon-shopping_cart","ipt-icomoon-theaters","ipt-icomoon-room","ipt-icomoon-lock_open","ipt-icomoon-lock_outline","ipt-icomoon-loyalty","ipt-icomoon-markunread_mailbox","ipt-icomoon-note_add","ipt-icomoon-offline_pin","ipt-icomoon-open_in_browser","ipt-icomoon-open_with","ipt-icomoon-pageview","ipt-icomoon-pan_tool","ipt-icomoon-perm_camera_mic","ipt-icomoon-perm_contact_calendar","ipt-icomoon-perm_device_information","ipt-icomoon-perm_media","ipt-icomoon-perm_phone_msg","ipt-icomoon-perm_scan_wifi","ipt-icomoon-pets","ipt-icomoon-picture_in_picture","ipt-icomoon-picture_in_picture_alt","ipt-icomoon-polymer","ipt-icomoon-power_settings_new","ipt-icomoon-pregnant_woman","ipt-icomoon-receipt","ipt-icomoon-record_voice_over","ipt-icomoon-visibility","ipt-icomoon-remove_shopping_cart","ipt-icomoon-restore_page","ipt-icomoon-rounded_corner","ipt-icomoon-rowing","ipt-icomoon-settings_applications","ipt-icomoon-settings_backup_restore","ipt-icomoon-settings_bluetooth","ipt-icomoon-settings_brightness","ipt-icomoon-settings_cell","ipt-icomoon-settings_ethernet","ipt-icomoon-settings_input_composite","ipt-icomoon-settings_input_hdmi","ipt-icomoon-settings_input_svideo","ipt-icomoon-settings_overscan","ipt-icomoon-settings_phone","ipt-icomoon-settings_power","ipt-icomoon-settings_remote","ipt-icomoon-shop","ipt-icomoon-shop_two","ipt-icomoon-shopping_basket","ipt-icomoon-speaker_notes","ipt-icomoon-speaker_notes_off","ipt-icomoon-spellcheck","ipt-icomoon-subject","ipt-icomoon-supervisor_account","ipt-icomoon-swap_horiz","ipt-icomoon-swap_vert","ipt-icomoon-system_update_alt","ipt-icomoon-thumb_down","ipt-icomoon-thumb_up","ipt-icomoon-thumbs_up_down","ipt-icomoon-timeline","ipt-icomoon-toc","ipt-icomoon-today","ipt-icomoon-toll","ipt-icomoon-track_changes","ipt-icomoon-translate","ipt-icomoon-trending_down","ipt-icomoon-trending_flat","ipt-icomoon-trending_up","ipt-icomoon-update","ipt-icomoon-view_agenda","ipt-icomoon-view_array","ipt-icomoon-view_carousel","ipt-icomoon-view_column","ipt-icomoon-view_day","ipt-icomoon-view_headline","ipt-icomoon-view_list","ipt-icomoon-view_module","ipt-icomoon-view_stream","ipt-icomoon-view_week","ipt-icomoon-visibility_off","ipt-icomoon-watch_later","ipt-icomoon-work","ipt-icomoon-youtube_searched_for","ipt-icomoon-zoom_in","ipt-icomoon-zoom_out","ipt-icomoon-search","ipt-icomoon-star","ipt-icomoon-home","ipt-icomoon-lock","ipt-icomoon-book","ipt-icomoon-print","ipt-icomoon-gavel","ipt-icomoon-dashboard","ipt-icomoon-code","ipt-icomoon-info","ipt-icomoon-android","ipt-icomoon-language","ipt-icomoon-copyright","ipt-icomoon-motorcycle","ipt-icomoon-accessibility","ipt-icomoon-tab","ipt-icomoon-settings"],"Material Icons: Alert":["ipt-icomoon-add_alert","ipt-icomoon-error","ipt-icomoon-error_outline"],"Material Icons: AV":["ipt-icomoon-queue","ipt-icomoon-add_to_queue","ipt-icomoon-airplay","ipt-icomoon-album","ipt-icomoon-art_track","ipt-icomoon-av_timer","ipt-icomoon-branding_watermark","ipt-icomoon-call_to_action","ipt-icomoon-closed_caption","ipt-icomoon-not_interested","ipt-icomoon-explicit","ipt-icomoon-fast_forward","ipt-icomoon-fast_rewind","ipt-icomoon-featured_play_list","ipt-icomoon-featured_video","ipt-icomoon-fiber_manual_record","ipt-icomoon-forward_10","ipt-icomoon-forward_30","ipt-icomoon-forward_5","ipt-icomoon-games","ipt-icomoon-hd","ipt-icomoon-hearing","ipt-icomoon-high_quality","ipt-icomoon-mic","ipt-icomoon-mic_none","ipt-icomoon-mic_off","ipt-icomoon-music_video","ipt-icomoon-new_releases","ipt-icomoon-note","ipt-icomoon-pause_circle_filled","ipt-icomoon-pause_circle_outline","ipt-icomoon-play_arrow","ipt-icomoon-play_circle_outline","ipt-icomoon-playlist_add","ipt-icomoon-playlist_add_check","ipt-icomoon-playlist_play","ipt-icomoon-queue_music","ipt-icomoon-queue_play_next","ipt-icomoon-radio","ipt-icomoon-recent_actors","ipt-icomoon-remove_from_queue","ipt-icomoon-repeat_one","ipt-icomoon-replay","ipt-icomoon-replay_10","ipt-icomoon-replay_30","ipt-icomoon-replay_5","ipt-icomoon-skip_next","ipt-icomoon-skip_previous","ipt-icomoon-slow_motion_video","ipt-icomoon-snooze","ipt-icomoon-sort_by_alpha","ipt-icomoon-subscriptions","ipt-icomoon-subtitles","ipt-icomoon-surround_sound","ipt-icomoon-video_call","ipt-icomoon-video_label","ipt-icomoon-video_library","ipt-icomoon-videocam","ipt-icomoon-videocam_off","ipt-icomoon-volume_down","ipt-icomoon-volume_mute","ipt-icomoon-volume_off","ipt-icomoon-volume_up","ipt-icomoon-web","ipt-icomoon-web_asset","ipt-icomoon-repeat","ipt-icomoon-pause","ipt-icomoon-stop","ipt-icomoon-equalizer","ipt-icomoon-loop","ipt-icomoon-shuffle"],"Material Icons: Communication":["ipt-icomoon-call_end","ipt-icomoon-call_made","ipt-icomoon-call_missed","ipt-icomoon-call_missed_outgoing","ipt-icomoon-call_received","ipt-icomoon-call_split","ipt-icomoon-chat","ipt-icomoon-chat_bubble","ipt-icomoon-chat_bubble_outline","ipt-icomoon-clear_all","ipt-icomoon-contact_mail","ipt-icomoon-contact_phone","ipt-icomoon-contacts","ipt-icomoon-dialer_sip","ipt-icomoon-dialpad","ipt-icomoon-import_contacts","ipt-icomoon-import_export","ipt-icomoon-invert_colors_off","ipt-icomoon-live_help","ipt-icomoon-location_off","ipt-icomoon-mail_outline","ipt-icomoon-message","ipt-icomoon-phonelink_erase","ipt-icomoon-phonelink_lock","ipt-icomoon-phonelink_ring","ipt-icomoon-phonelink_setup","ipt-icomoon-portable_wifi_off","ipt-icomoon-present_to_all","ipt-icomoon-ring_volume","ipt-icomoon-rss_feed","ipt-icomoon-screen_share","ipt-icomoon-stay_primary_portrait","ipt-icomoon-textsms","ipt-icomoon-stay_primary_landscape","ipt-icomoon-stop_screen_share","ipt-icomoon-swap_calls","ipt-icomoon-voicemail","ipt-icomoon-vpn_key","ipt-icomoon-comment","ipt-icomoon-phone"],"Material Icons: Content":["ipt-icomoon-add","ipt-icomoon-add_box","ipt-icomoon-add_circle","ipt-icomoon-backspace","ipt-icomoon-block","ipt-icomoon-content_copy","ipt-icomoon-content_cut","ipt-icomoon-content_paste","ipt-icomoon-delete_sweep","ipt-icomoon-remove_circle","ipt-icomoon-drafts","ipt-icomoon-markunread","ipt-icomoon-filter_list","ipt-icomoon-font_download","ipt-icomoon-gesture","ipt-icomoon-low_priority","ipt-icomoon-move_to_inbox","ipt-icomoon-next_week","ipt-icomoon-remove_circle_outline","ipt-icomoon-reply_all","ipt-icomoon-report","ipt-icomoon-select_all","ipt-icomoon-text_format","ipt-icomoon-unarchive","ipt-icomoon-weekend","ipt-icomoon-inbox","ipt-icomoon-flag","ipt-icomoon-forward","ipt-icomoon-sort","ipt-icomoon-archive","ipt-icomoon-undo","ipt-icomoon-redo","ipt-icomoon-reply","ipt-icomoon-remove","ipt-icomoon-link","ipt-icomoon-mail"],"Material Icons: Device":["ipt-icomoon-access_alarms","ipt-icomoon-airplanemode_inactive","ipt-icomoon-battery_charging_full","ipt-icomoon-battery_std","ipt-icomoon-battery_unknown","ipt-icomoon-bluetooth_searching","ipt-icomoon-bluetooth_connected","ipt-icomoon-bluetooth_disabled","ipt-icomoon-brightness_low","ipt-icomoon-brightness_medium","ipt-icomoon-brightness_high","ipt-icomoon-brightness_auto","ipt-icomoon-data_usage","ipt-icomoon-developer_mode","ipt-icomoon-dvr","ipt-icomoon-location_searching","ipt-icomoon-location_disabled","ipt-icomoon-graphic_eq","ipt-icomoon-network_cell","ipt-icomoon-network_wifi","ipt-icomoon-nfc","ipt-icomoon-signal_cellular_no_sim","ipt-icomoon-screen_lock_landscape","ipt-icomoon-screen_lock_portrait","ipt-icomoon-screen_lock_rotation","ipt-icomoon-screen_rotation","ipt-icomoon-sd_storage","ipt-icomoon-settings_system_daydream","ipt-icomoon-signal_cellular_4_bar","ipt-icomoon-signal_cellular_connected_no_internet_4_bar","ipt-icomoon-signal_cellular_null","ipt-icomoon-signal_cellular_off","ipt-icomoon-signal_wifi_4_bar","ipt-icomoon-signal_wifi_4_bar_lock","ipt-icomoon-signal_wifi_off","ipt-icomoon-wallpaper","ipt-icomoon-wifi_lock","ipt-icomoon-wifi_tethering","ipt-icomoon-usb","ipt-icomoon-bluetooth","ipt-icomoon-storage"],"Material Icons: Editor":["ipt-icomoon-attach_file","ipt-icomoon-attach_money","ipt-icomoon-border_all","ipt-icomoon-border_bottom","ipt-icomoon-border_clear","ipt-icomoon-border_color","ipt-icomoon-border_horizontal","ipt-icomoon-border_inner","ipt-icomoon-border_left","ipt-icomoon-border_outer","ipt-icomoon-border_right","ipt-icomoon-border_style","ipt-icomoon-border_top","ipt-icomoon-border_vertical","ipt-icomoon-bubble_chart","ipt-icomoon-merge_type","ipt-icomoon-mode_edit","ipt-icomoon-drag_handle","ipt-icomoon-insert_invitation","ipt-icomoon-format_align_center","ipt-icomoon-format_align_justify","ipt-icomoon-format_align_left","ipt-icomoon-format_align_right","ipt-icomoon-format_bold","ipt-icomoon-format_clear","ipt-icomoon-format_color_fill","ipt-icomoon-format_color_reset","ipt-icomoon-format_color_text","ipt-icomoon-format_indent_decrease","ipt-icomoon-format_indent_increase","ipt-icomoon-format_italic","ipt-icomoon-format_line_spacing","ipt-icomoon-format_list_bulleted","ipt-icomoon-format_list_numbered","ipt-icomoon-format_paint","ipt-icomoon-format_quote","ipt-icomoon-format_shapes","ipt-icomoon-format_size","ipt-icomoon-format_strikethrough","ipt-icomoon-format_textdirection_l_to_r","ipt-icomoon-format_textdirection_r_to_l","ipt-icomoon-functions","ipt-icomoon-highlight","ipt-icomoon-insert_comment","ipt-icomoon-insert_drive_file","ipt-icomoon-linear_scale","ipt-icomoon-mode_comment","ipt-icomoon-monetization_on","ipt-icomoon-money_off","ipt-icomoon-multiline_chart","ipt-icomoon-pie_chart","ipt-icomoon-publish","ipt-icomoon-short_text","ipt-icomoon-show_chart","ipt-icomoon-space_bar","ipt-icomoon-strikethrough_s","ipt-icomoon-text_fields","ipt-icomoon-title","ipt-icomoon-vertical_align_bottom","ipt-icomoon-vertical_align_center","ipt-icomoon-vertical_align_top","ipt-icomoon-wrap_text"],"Material Icons: File":["ipt-icomoon-cloud_upload","ipt-icomoon-cloud_circle","ipt-icomoon-cloud_done","ipt-icomoon-cloud_download","ipt-icomoon-cloud_off","ipt-icomoon-cloud_queue","ipt-icomoon-create_new_folder","ipt-icomoon-file_upload","ipt-icomoon-folder_open","ipt-icomoon-folder_shared","ipt-icomoon-folder","ipt-icomoon-cloud","ipt-icomoon-attachment"],"Material Icons: Hardware":["ipt-icomoon-cast","ipt-icomoon-cast_connected","ipt-icomoon-desktop_mac","ipt-icomoon-desktop_windows","ipt-icomoon-device_hub","ipt-icomoon-phonelink","ipt-icomoon-devices_other","ipt-icomoon-dock","ipt-icomoon-headset","ipt-icomoon-headset_mic","ipt-icomoon-keyboard_arrow_down","ipt-icomoon-keyboard_arrow_left","ipt-icomoon-keyboard_arrow_right","ipt-icomoon-keyboard_arrow_up","ipt-icomoon-keyboard_backspace","ipt-icomoon-keyboard_capslock","ipt-icomoon-keyboard_hide","ipt-icomoon-keyboard_return","ipt-icomoon-keyboard_tab","ipt-icomoon-keyboard_voice","ipt-icomoon-laptop_chromebook","ipt-icomoon-laptop_mac","ipt-icomoon-laptop_windows","ipt-icomoon-memory","ipt-icomoon-mouse","ipt-icomoon-phone_android","ipt-icomoon-phone_iphone","ipt-icomoon-phonelink_off","ipt-icomoon-power_input","ipt-icomoon-router","ipt-icomoon-scanner","ipt-icomoon-security","ipt-icomoon-sim_card","ipt-icomoon-speaker","ipt-icomoon-speaker_group","ipt-icomoon-tablet_android","ipt-icomoon-tablet_mac","ipt-icomoon-toys","ipt-icomoon-watch","ipt-icomoon-laptop","ipt-icomoon-tablet","ipt-icomoon-gamepad","ipt-icomoon-keyboard","ipt-icomoon-tv"],"Material Icons: Image":["ipt-icomoon-add_a_photo","ipt-icomoon-control_point","ipt-icomoon-audiotrack","ipt-icomoon-blur_circular","ipt-icomoon-blur_linear","ipt-icomoon-blur_off","ipt-icomoon-blur_on","ipt-icomoon-brightness_1","ipt-icomoon-brightness_2","ipt-icomoon-brightness_3","ipt-icomoon-brightness_4","ipt-icomoon-broken_image","ipt-icomoon-brush","ipt-icomoon-burst_mode","ipt-icomoon-photo_camera","ipt-icomoon-camera_front","ipt-icomoon-camera_rear","ipt-icomoon-camera_roll","ipt-icomoon-center_focus_strong","ipt-icomoon-center_focus_weak","ipt-icomoon-navigate_before","ipt-icomoon-navigate_next","ipt-icomoon-wb_cloudy","ipt-icomoon-photo_library","ipt-icomoon-collections_bookmark","ipt-icomoon-palette","ipt-icomoon-colorize","ipt-icomoon-compare","ipt-icomoon-control_point_duplicate","ipt-icomoon-crop_16_9","ipt-icomoon-crop_3_2","ipt-icomoon-crop_landscape","ipt-icomoon-crop_7_5","ipt-icomoon-crop_din","ipt-icomoon-crop_free","ipt-icomoon-crop_original","ipt-icomoon-crop_portrait","ipt-icomoon-crop_rotate","ipt-icomoon-crop_square","ipt-icomoon-dehaze","ipt-icomoon-details","ipt-icomoon-exposure","ipt-icomoon-exposure_neg_1","ipt-icomoon-exposure_neg_2","ipt-icomoon-exposure_plus_1","ipt-icomoon-exposure_plus_2","ipt-icomoon-exposure_zero","ipt-icomoon-filter_1","ipt-icomoon-filter_2","ipt-icomoon-filter_3","ipt-icomoon-filter_4","ipt-icomoon-filter_5","ipt-icomoon-filter_6","ipt-icomoon-filter_7","ipt-icomoon-filter_8","ipt-icomoon-filter_9","ipt-icomoon-filter_9_plus","ipt-icomoon-filter_b_and_w","ipt-icomoon-filter_center_focus","ipt-icomoon-filter_drama","ipt-icomoon-filter_frames","ipt-icomoon-filter_none","ipt-icomoon-filter_tilt_shift","ipt-icomoon-filter_vintage","ipt-icomoon-flare","ipt-icomoon-flash_auto","ipt-icomoon-flash_off","ipt-icomoon-flash_on","ipt-icomoon-gradient","ipt-icomoon-grain","ipt-icomoon-grid_off","ipt-icomoon-grid_on","ipt-icomoon-hdr_off","ipt-icomoon-hdr_on","ipt-icomoon-hdr_strong","ipt-icomoon-hdr_weak","ipt-icomoon-healing","ipt-icomoon-image_aspect_ratio","ipt-icomoon-tag_faces","ipt-icomoon-iso","ipt-icomoon-leak_add","ipt-icomoon-leak_remove","ipt-icomoon-lens","ipt-icomoon-linked_camera","ipt-icomoon-looks","ipt-icomoon-looks_3","ipt-icomoon-looks_4","ipt-icomoon-looks_5","ipt-icomoon-looks_6","ipt-icomoon-looks_one","ipt-icomoon-looks_two","ipt-icomoon-loupe","ipt-icomoon-monochrome_photos","ipt-icomoon-movie_creation","ipt-icomoon-movie_filter","ipt-icomoon-music_note","ipt-icomoon-nature","ipt-icomoon-nature_people","ipt-icomoon-panorama","ipt-icomoon-panorama_horizontal","ipt-icomoon-panorama_vertical","ipt-icomoon-panorama_wide_angle","ipt-icomoon-photo_album","ipt-icomoon-photo_filter","ipt-icomoon-photo_size_select_actual","ipt-icomoon-photo_size_select_large","ipt-icomoon-photo_size_select_small","ipt-icomoon-picture_as_pdf","ipt-icomoon-portrait","ipt-icomoon-rotate_90_degrees_ccw","ipt-icomoon-rotate_left","ipt-icomoon-rotate_right","ipt-icomoon-slideshow","ipt-icomoon-straighten","ipt-icomoon-style","ipt-icomoon-switch_camera","ipt-icomoon-switch_video","ipt-icomoon-texture","ipt-icomoon-timelapse","ipt-icomoon-timer","ipt-icomoon-timer_10","ipt-icomoon-timer_3","ipt-icomoon-timer_off","ipt-icomoon-tonality","ipt-icomoon-transform","ipt-icomoon-tune","ipt-icomoon-view_comfy","ipt-icomoon-view_compact","ipt-icomoon-vignette","ipt-icomoon-wb_auto","ipt-icomoon-wb_incandescent","ipt-icomoon-wb_sunny","ipt-icomoon-camera","ipt-icomoon-adjust","ipt-icomoon-edit","ipt-icomoon-filter","ipt-icomoon-crop","ipt-icomoon-image","ipt-icomoon-flip"],"Material Icons: Maps":["ipt-icomoon-add_location","ipt-icomoon-flight","ipt-icomoon-beenhere","ipt-icomoon-directions","ipt-icomoon-directions_bike","ipt-icomoon-directions_bus","ipt-icomoon-directions_car","ipt-icomoon-directions_transit","ipt-icomoon-directions_walk","ipt-icomoon-edit_location","ipt-icomoon-ev_station","ipt-icomoon-terrain","ipt-icomoon-my_location","ipt-icomoon-local_hotel","ipt-icomoon-layers","ipt-icomoon-layers_clear","ipt-icomoon-local_play","ipt-icomoon-local_airport","ipt-icomoon-local_atm","ipt-icomoon-local_bar","ipt-icomoon-local_cafe","ipt-icomoon-local_car_wash","ipt-icomoon-local_convenience_store","ipt-icomoon-restaurant_menu","ipt-icomoon-local_drink","ipt-icomoon-local_florist","ipt-icomoon-local_gas_station","ipt-icomoon-local_hospital","ipt-icomoon-local_laundry_service","ipt-icomoon-local_library","ipt-icomoon-local_mall","ipt-icomoon-local_offer","ipt-icomoon-local_parking","ipt-icomoon-local_pharmacy","ipt-icomoon-local_pizza","ipt-icomoon-local_shipping","ipt-icomoon-local_taxi","ipt-icomoon-navigation","ipt-icomoon-near_me","ipt-icomoon-person_pin","ipt-icomoon-person_pin_circle","ipt-icomoon-pin_drop","ipt-icomoon-rate_review","ipt-icomoon-restaurant","ipt-icomoon-satellite","ipt-icomoon-store_mall_directory","ipt-icomoon-streetview","ipt-icomoon-traffic","ipt-icomoon-tram","ipt-icomoon-transfer_within_a_station","ipt-icomoon-zoom_out_map","ipt-icomoon-train","ipt-icomoon-subway","ipt-icomoon-map"],"Material Icons: Navigation":["ipt-icomoon-adb","ipt-icomoon-airline_seat_flat","ipt-icomoon-airline_seat_individual_suite","ipt-icomoon-airline_seat_legroom_extra","ipt-icomoon-airline_seat_legroom_normal","ipt-icomoon-airline_seat_legroom_reduced","ipt-icomoon-airline_seat_recline_extra","ipt-icomoon-airline_seat_recline_normal","ipt-icomoon-apps","ipt-icomoon-arrow_back","ipt-icomoon-arrow_downward","ipt-icomoon-arrow_drop_down","ipt-icomoon-arrow_drop_down_circle","ipt-icomoon-arrow_drop_up","ipt-icomoon-arrow_forward","ipt-icomoon-cancel","ipt-icomoon-confirmation_number","ipt-icomoon-disc_full","ipt-icomoon-do_not_disturb_alt","ipt-icomoon-do_not_disturb_off","ipt-icomoon-time_to_leave","ipt-icomoon-enhanced_encryption","ipt-icomoon-event_available","ipt-icomoon-event_busy","ipt-icomoon-event_note","ipt-icomoon-expand_less","ipt-icomoon-expand_more","ipt-icomoon-sms_failed","ipt-icomoon-first_page","ipt-icomoon-folder_special","ipt-icomoon-fullscreen","ipt-icomoon-fullscreen_exit","ipt-icomoon-last_page","ipt-icomoon-live_tv","ipt-icomoon-sync","ipt-icomoon-mms","ipt-icomoon-more","ipt-icomoon-more_horiz","ipt-icomoon-more_vert","ipt-icomoon-network_check","ipt-icomoon-network_locked","ipt-icomoon-no_encryption","ipt-icomoon-ondemand_video","ipt-icomoon-personal_video","ipt-icomoon-phone_bluetooth_speaker","ipt-icomoon-phone_forwarded","ipt-icomoon-phone_in_talk","ipt-icomoon-phone_locked","ipt-icomoon-phone_missed","ipt-icomoon-phone_paused","ipt-icomoon-power","ipt-icomoon-priority_high","ipt-icomoon-sim_card_alert","ipt-icomoon-subdirectory_arrow_left","ipt-icomoon-subdirectory_arrow_right","ipt-icomoon-sync_disabled","ipt-icomoon-sync_problem","ipt-icomoon-system_update","ipt-icomoon-tap_and_play","ipt-icomoon-vibration","ipt-icomoon-voice_chat","ipt-icomoon-vpn_lock","ipt-icomoon-wc","ipt-icomoon-check","ipt-icomoon-refresh","ipt-icomoon-wifi","ipt-icomoon-menu","ipt-icomoon-close"],"Material Icons: Places":["ipt-icomoon-ac_unit","ipt-icomoon-airport_shuttle","ipt-icomoon-all_inclusive","ipt-icomoon-beach_access","ipt-icomoon-business_center","ipt-icomoon-casino","ipt-icomoon-child_care","ipt-icomoon-fitness_center","ipt-icomoon-free_breakfast","ipt-icomoon-golf_course","ipt-icomoon-hot_tub","ipt-icomoon-kitchen","ipt-icomoon-pool","ipt-icomoon-room_service","ipt-icomoon-rv_hookup","ipt-icomoon-smoke_free","ipt-icomoon-spa"],"Material Icons: Social":["ipt-icomoon-poll","ipt-icomoon-domain","ipt-icomoon-cake","ipt-icomoon-people","ipt-icomoon-group_add","ipt-icomoon-location_city","ipt-icomoon-mood_bad","ipt-icomoon-notifications","ipt-icomoon-notifications_active","ipt-icomoon-notifications_none","ipt-icomoon-notifications_off","ipt-icomoon-notifications_paused","ipt-icomoon-pages","ipt-icomoon-party_mode","ipt-icomoon-people_outline","ipt-icomoon-person_outline","ipt-icomoon-person","ipt-icomoon-person_add","ipt-icomoon-plus_one","ipt-icomoon-public","ipt-icomoon-school","ipt-icomoon-sentiment_dissatisfied","ipt-icomoon-sentiment_neutral","ipt-icomoon-sentiment_satisfied","ipt-icomoon-sentiment_very_dissatisfied","ipt-icomoon-sentiment_very_satisfied","ipt-icomoon-whatshot","ipt-icomoon-group","ipt-icomoon-share"],"Material Icons: Toggle":["ipt-icomoon-check_box","ipt-icomoon-check_box_outline_blank","ipt-icomoon-indeterminate_check_box","ipt-icomoon-radio_button_unchecked","ipt-icomoon-radio_button_checked","ipt-icomoon-star_border","ipt-icomoon-star_half"],"Other Icons":["ipt-icomoon-alarm3","ipt-icomoon-schedule","ipt-icomoon-accessibility2","ipt-icomoon-adjust2","ipt-icomoon-airline_seat_flat_angled","ipt-icomoon-archive2","ipt-icomoon-assignment","ipt-icomoon-assistant","ipt-icomoon-battery_alert","ipt-icomoon-bluetooth2","ipt-icomoon-camera4","ipt-icomoon-camera_enhance","ipt-icomoon-redeem","ipt-icomoon-child_friendly","ipt-icomoon-close3","ipt-icomoon-laptop3","ipt-icomoon-copyright2","ipt-icomoon-crop3","ipt-icomoon-dashboard3","ipt-icomoon-date_range","ipt-icomoon-developer_board","ipt-icomoon-directions_boat","ipt-icomoon-directions_railway","ipt-icomoon-directions_run","ipt-icomoon-eject3","ipt-icomoon-favorite_border","ipt-icomoon-fiber_dvr","ipt-icomoon-fiber_new","ipt-icomoon-fiber_smart_record","ipt-icomoon-format_underlined","ipt-icomoon-g_translate","ipt-icomoon-gavel2","ipt-icomoon-goat","ipt-icomoon-inbox2","ipt-icomoon-input","ipt-icomoon-language2","ipt-icomoon-motorcycle2","ipt-icomoon-opacity","ipt-icomoon-perm_data_setting","ipt-icomoon-refresh2","ipt-icomoon-reorder2","ipt-icomoon-repeat2","ipt-icomoon-reply3","ipt-icomoon-send2","ipt-icomoon-shuffle2","ipt-icomoon-smoking_rooms","ipt-icomoon-sort2","ipt-icomoon-stars","ipt-icomoon-storage2","ipt-icomoon-subway2","ipt-icomoon-swap_vertical_circle","ipt-icomoon-tab_unselected","ipt-icomoon-touch_app","ipt-icomoon-train2","ipt-icomoon-tv3","ipt-icomoon-unfold_less","ipt-icomoon-unfold_more","ipt-icomoon-usb2","ipt-icomoon-videogame_asset","ipt-icomoon-view_quilt","ipt-icomoon-wb_iridescent","ipt-icomoon-widgets","ipt-icomoon-wifi2","ipt-icomoon-glass","ipt-icomoon-power-off","ipt-icomoon-signal","ipt-icomoon-headphones","ipt-icomoon-text-height","ipt-icomoon-text-width","ipt-icomoon-tint","ipt-icomoon-arrows","ipt-icomoon-step-backward","ipt-icomoon-fast-backward","ipt-icomoon-backward","ipt-icomoon-eject","ipt-icomoon-chevron-left","ipt-icomoon-chevron-right","ipt-icomoon-plus-circle","ipt-icomoon-minus-circle","ipt-icomoon-times-circle","ipt-icomoon-crosshairs","ipt-icomoon-times-circle-o","ipt-icomoon-ban","ipt-icomoon-compress","ipt-icomoon-minus","ipt-icomoon-asterisk","ipt-icomoon-exclamation-circle","ipt-icomoon-gift","ipt-icomoon-random","ipt-icomoon-chevron-up","ipt-icomoon-chevron-down","ipt-icomoon-retweet","ipt-icomoon-arrows-v","ipt-icomoon-arrows-h","ipt-icomoon-camera-retro","ipt-icomoon-sign-out","ipt-icomoon-sign-in","ipt-icomoon-trophy","ipt-icomoon-lemon-o","ipt-icomoon-square-o","ipt-icomoon-hdd-o","ipt-icomoon-bullhorn","ipt-icomoon-bell-o","ipt-icomoon-certificate","ipt-icomoon-hand-o-right","ipt-icomoon-hand-o-left","ipt-icomoon-hand-o-up","ipt-icomoon-hand-o-down","ipt-icomoon-tasks","ipt-icomoon-briefcase","ipt-icomoon-arrows-alt","ipt-icomoon-flask","ipt-icomoon-square","ipt-icomoon-magic","ipt-icomoon-caret-down","ipt-icomoon-caret-up","ipt-icomoon-caret-left","ipt-icomoon-caret-right","ipt-icomoon-columns","ipt-icomoon-sort-desc","ipt-icomoon-sort-asc","ipt-icomoon-bolt","ipt-icomoon-sitemap","ipt-icomoon-umbrella","ipt-icomoon-lightbulb-o","ipt-icomoon-exchange","ipt-icomoon-stethoscope","ipt-icomoon-suitcase","ipt-icomoon-bell","ipt-icomoon-cutlery","ipt-icomoon-building-o","ipt-icomoon-hospital-o","ipt-icomoon-ambulance","ipt-icomoon-medkit","ipt-icomoon-beer","ipt-icomoon-h-square","ipt-icomoon-plus-square","ipt-icomoon-angle-double-left","ipt-icomoon-angle-double-right","ipt-icomoon-angle-double-up","ipt-icomoon-angle-double-down","ipt-icomoon-angle-left","ipt-icomoon-angle-right","ipt-icomoon-angle-up","ipt-icomoon-angle-down","ipt-icomoon-mobile3","ipt-icomoon-circle-o","ipt-icomoon-circle","ipt-icomoon-mail-reply","ipt-icomoon-terminal","ipt-icomoon-mail-reply-all","ipt-icomoon-exclamation","ipt-icomoon-superscript","ipt-icomoon-subscript","ipt-icomoon-eraser","ipt-icomoon-puzzle-piece","ipt-icomoon-microphone","ipt-icomoon-microphone-slash","ipt-icomoon-shield","ipt-icomoon-rocket","ipt-icomoon-maxcdn","ipt-icomoon-chevron-circle-left","ipt-icomoon-chevron-circle-right","ipt-icomoon-chevron-circle-up","ipt-icomoon-chevron-circle-down","ipt-icomoon-bullseye","ipt-icomoon-ellipsis-h","ipt-icomoon-ellipsis-v","ipt-icomoon-rss-square","ipt-icomoon-minus-square","ipt-icomoon-minus-square-o","ipt-icomoon-level-up","ipt-icomoon-level-down","ipt-icomoon-compass2","ipt-icomoon-caret-square-o-down","ipt-icomoon-caret-square-o-up","ipt-icomoon-caret-square-o-right","ipt-icomoon-sort-alpha-asc","ipt-icomoon-sort-alpha-desc","ipt-icomoon-sort-amount-asc","ipt-icomoon-sort-amount-desc","ipt-icomoon-sort-numeric-asc","ipt-icomoon-sort-numeric-desc","ipt-icomoon-youtube-square","ipt-icomoon-youtube","ipt-icomoon-xing","ipt-icomoon-xing-square","ipt-icomoon-dropbox","ipt-icomoon-stack-overflow","ipt-icomoon-instagram","ipt-icomoon-flickr","ipt-icomoon-adn","ipt-icomoon-bitbucket","ipt-icomoon-bitbucket-square","ipt-icomoon-dribbble","ipt-icomoon-foursquare","ipt-icomoon-trello","ipt-icomoon-female","ipt-icomoon-male","ipt-icomoon-gittip","ipt-icomoon-bug","ipt-icomoon-vk","ipt-icomoon-weibo","ipt-icomoon-renren","ipt-icomoon-pagelines","ipt-icomoon-stack-exchange","ipt-icomoon-caret-square-o-left","ipt-icomoon-dot-circle-o","ipt-icomoon-wheelchair","ipt-icomoon-plus-square-o","ipt-icomoon-space-shuttle","ipt-icomoon-slack","ipt-icomoon-openid","ipt-icomoon-bank","ipt-icomoon-graduation-cap","ipt-icomoon-delicious2","ipt-icomoon-digg","ipt-icomoon-pied-piper","ipt-icomoon-pied-piper-alt","ipt-icomoon-drupal","ipt-icomoon-fax","ipt-icomoon-building","ipt-icomoon-child","ipt-icomoon-paw","ipt-icomoon-spoon","ipt-icomoon-cube","ipt-icomoon-cubes","ipt-icomoon-behance","ipt-icomoon-behance-square","ipt-icomoon-steam3","ipt-icomoon-steam-square","ipt-icomoon-recycle","ipt-icomoon-tree2","ipt-icomoon-spotify","ipt-icomoon-deviantart3","ipt-icomoon-database","ipt-icomoon-vine","ipt-icomoon-codepen","ipt-icomoon-jsfiddle","ipt-icomoon-circle-o-notch","ipt-icomoon-git-square","ipt-icomoon-hacker-news","ipt-icomoon-tencent-weibo","ipt-icomoon-qq","ipt-icomoon-wechat","ipt-icomoon-circle-thin","ipt-icomoon-header","ipt-icomoon-paragraph","ipt-icomoon-sliders","ipt-icomoon-bomb","ipt-icomoon-futbol-o","ipt-icomoon-tty","ipt-icomoon-binoculars2","ipt-icomoon-plug","ipt-icomoon-slideshare","ipt-icomoon-twitch","ipt-icomoon-google-wallet","ipt-icomoon-cc-visa","ipt-icomoon-cc-mastercard","ipt-icomoon-cc-discover","ipt-icomoon-cc-amex","ipt-icomoon-cc-stripe","ipt-icomoon-bell-slash","ipt-icomoon-bell-slash-o","ipt-icomoon-eyedropper","ipt-icomoon-birthday-cake","ipt-icomoon-toggle-off","ipt-icomoon-toggle-on","ipt-icomoon-bicycle","ipt-icomoon-ioxhost","ipt-icomoon-angellist","ipt-icomoon-cc","ipt-icomoon-ils","ipt-icomoon-meanpath","ipt-icomoon-buysellads","ipt-icomoon-connectdevelop","ipt-icomoon-dashcube","ipt-icomoon-forumbee","ipt-icomoon-leanpub","ipt-icomoon-sellsy","ipt-icomoon-shirtsinbulk","ipt-icomoon-simplybuilt","ipt-icomoon-skyatlas","ipt-icomoon-diamond","ipt-icomoon-ship","ipt-icomoon-street-view","ipt-icomoon-heartbeat","ipt-icomoon-venus","ipt-icomoon-mars","ipt-icomoon-mercury","ipt-icomoon-intersex","ipt-icomoon-transgender-alt","ipt-icomoon-venus-double","ipt-icomoon-mars-double","ipt-icomoon-venus-mars","ipt-icomoon-mars-stroke","ipt-icomoon-mars-stroke-v","ipt-icomoon-mars-stroke-h","ipt-icomoon-neuter","ipt-icomoon-genderless","ipt-icomoon-whatsapp","ipt-icomoon-server","ipt-icomoon-viacoin","ipt-icomoon-medium","ipt-icomoon-y-combinator","ipt-icomoon-optin-monster","ipt-icomoon-opencart","ipt-icomoon-expeditedssl","ipt-icomoon-battery-4","ipt-icomoon-battery-3","ipt-icomoon-battery-2","ipt-icomoon-battery-1","ipt-icomoon-battery-0","ipt-icomoon-i-cursor","ipt-icomoon-object-ungroup","ipt-icomoon-sticky-note","ipt-icomoon-sticky-note-o","ipt-icomoon-cc-jcb","ipt-icomoon-cc-diners-club","ipt-icomoon-clone","ipt-icomoon-balance-scale","ipt-icomoon-hourglass-o","ipt-icomoon-hourglass-1","ipt-icomoon-hourglass-2","ipt-icomoon-hourglass-3","ipt-icomoon-hourglass","ipt-icomoon-hand-grab-o","ipt-icomoon-hand-paper-o","ipt-icomoon-hand-lizard-o","ipt-icomoon-hand-spock-o","ipt-icomoon-hand-pointer-o","ipt-icomoon-hand-peace-o","ipt-icomoon-trademark","ipt-icomoon-registered","ipt-icomoon-creative-commons","ipt-icomoon-gg","ipt-icomoon-gg-circle","ipt-icomoon-tripadvisor","ipt-icomoon-odnoklassniki","ipt-icomoon-odnoklassniki-square","ipt-icomoon-get-pocket","ipt-icomoon-wikipedia-w","ipt-icomoon-contao","ipt-icomoon-500px","ipt-icomoon-amazon","ipt-icomoon-industry","ipt-icomoon-commenting","ipt-icomoon-commenting-o","ipt-icomoon-houzz","ipt-icomoon-black-tie","ipt-icomoon-fonticons","ipt-icomoon-edge","ipt-icomoon-codiepie","ipt-icomoon-modx","ipt-icomoon-fort-awesome","ipt-icomoon-product-hunt","ipt-icomoon-mixcloud","ipt-icomoon-scribd","ipt-icomoon-stop-circle","ipt-icomoon-stop-circle-o","ipt-icomoon-shopping-bag","ipt-icomoon-shopping-basket","ipt-icomoon-hashtag","ipt-icomoon-bluetooth-b","ipt-icomoon-percent","ipt-icomoon-gitlab","ipt-icomoon-wpbeginner","ipt-icomoon-wpforms","ipt-icomoon-envira","ipt-icomoon-universal-access","ipt-icomoon-wheelchair-alt","ipt-icomoon-blind","ipt-icomoon-audio-description","ipt-icomoon-braille","ipt-icomoon-assistive-listening-systems","ipt-icomoon-american-sign-language-interpreting","ipt-icomoon-deaf","ipt-icomoon-glide","ipt-icomoon-glide-g","ipt-icomoon-sign-language","ipt-icomoon-low-vision","ipt-icomoon-viadeo","ipt-icomoon-viadeo-square","ipt-icomoon-snapchat","ipt-icomoon-snapchat-ghost","ipt-icomoon-snapchat-square","ipt-icomoon-thermometer","ipt-icomoon-none","ipt-icomoon-Celsius","ipt-icomoon-Fahrenheit","ipt-icomoon-droplet","ipt-icomoon-pacman","ipt-icomoon-spades","ipt-icomoon-clubs","ipt-icomoon-diamonds","ipt-icomoon-pawn","ipt-icomoon-bell2","ipt-icomoon-quotes-left","ipt-icomoon-wand","ipt-icomoon-aid","ipt-icomoon-bug2","ipt-icomoon-meter2","ipt-icomoon-dashboard2","ipt-icomoon-shield2","ipt-icomoon-powercord","ipt-icomoon-tree","ipt-icomoon-minus2","ipt-icomoon-checkbox-unchecked","ipt-icomoon-checkbox-partial","ipt-icomoon-console","ipt-icomoon-lanyrd","ipt-icomoon-IcoMoon","ipt-icomoon-meter"]};


			this.jElement.find('.ipt_uif_icon_selector').each(function() {
				// Set the variables
				var elm = $(this),
				iconPickerArgs = {
					searchSource: searchSource,
					useAttribute: true,
					attributeName: 'data-ipt-icomoon',
					theme: 'fip-ipt',
					appendTo: 'body',
					emptyIconValue: 'none'
				};

				// Check what to print by
				if ( elm.data( 'iconBy' ) == 'hex' ) {
					iconPickerArgs.source = source;
				} else {
					iconPickerArgs.source = sourceClass;
					iconPickerArgs.useAttribute = false;
				}

				// Check if no empty value
				if ( elm.data('noEmpty') ) {
					iconPickerArgs.emptyIconValue = '';
					iconPickerArgs.emptyIcon = false;
				}
				// Create the stuff
				elm.fontIconPicker( iconPickerArgs );
			});
		},

		// Date and Datetime picker
		uiApplyDateTimePicker: function() {
			// Date picker
			this.jElement.find('.ipt_uif_datepicker input.ipt_uif_text').datepicker({
				dateFormat : 'yy-mm-dd',
				beforeShow : function() {
					$('body').addClass('ipt_uif_common');
				},
				onClose : function() {
					$('body').removeClass('ipt_uif_common');
				},
				showButtonPanel: true,
				closeText: ERINVl10n.closeText,
				currentText: ERINVl10n.currentText,
				monthNames: ERINVl10n.monthNames,
				monthNamesShort: ERINVl10n.monthNamesShort,
				dayNames: ERINVl10n.dayNames,
				dayNamesShort: ERINVl10n.dayNamesShort,
				dayNamesMin: ERINVl10n.dayNamesMin,
				firstDay: ERINVl10n.firstDay,
				isRTL: ERINVl10n.isRTL,
				timezoneText : ERINVl10n.timezoneText,
				changeMonth: true,
				changeYear: true,
				yearRange: 'c-50:c+50'
			});

			// Date Time Picker
			this.jElement.find('.ipt_uif_datetimepicker input.ipt_uif_text').datetimepicker({
				dateFormat : 'yy-mm-dd',
				timeFormat : 'HH:mm:ss',
				beforeShow : function() {
					$('body').addClass('ipt_uif_common');
				},
				onClose : function() {
					$('body').removeClass('ipt_uif_common');
				},
				showButtonPanel: true,
				closeText: ERINVl10n.closeText,
				currentText: ERINVl10n.tcurrentText,
				monthNames: ERINVl10n.monthNames,
				monthNamesShort: ERINVl10n.monthNamesShort,
				dayNames: ERINVl10n.dayNames,
				dayNamesShort: ERINVl10n.dayNamesShort,
				dayNamesMin: ERINVl10n.dayNamesMin,
				firstDay: ERINVl10n.firstDay,
				isRTL: ERINVl10n.isRTL,
				amNames : ERINVl10n.amNames,
				pmNames : ERINVl10n.pmNames,
				timeSuffix : ERINVl10n.timeSuffix,
				timeOnlyTitle : ERINVl10n.timeOnlyTitle,
				timeText : ERINVl10n.timeText,
				hourText : ERINVl10n.hourText,
				minuteText : ERINVl10n.minuteText,
				secondText : ERINVl10n.secondText,
				millisecText : ERINVl10n.millisecText,
				microsecText : ERINVl10n.microsecText,
				timezoneText : ERINVl10n.timezoneText,
				changeMonth: true,
				changeYear: true,
				yearRange: 'c-50:c+50'
			});
		},

		// Font Selector
		uiApplyFontSelector: function() {
			this.jElement.find('.ipt_uif_font_selector').each(function() {
				// Create the initial
				var select = $(this).find('select').eq(0),
				preview = $(this).find('.ipt_uif_font_preview').eq(0),
				selected = select.find('option:selected'),
				font_suffix = selected.data('fontinclude'),
				font_key = selected.val(),
				font_family = selected.text();

				//Attach the link
				if ( ! $('#ipt_uif_webfont_' + font_key).length ) {
					$('<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=' + font_suffix + '" id="ipt_uif_webfont_' + font_key + '" />').appendTo('head');
				}

				//Change the font family
				preview.css({fontFamily : font_family});
			});
		},

		uiApplyThemeSelector: function() {
			this.jElement.find('.ipt_uif_theme_selector').each(function() {
				var select = $(this),
				preview = select.next('.ipt_uif_theme_preview'),
				selected = select.find('option:selected'),
				colors = selected.data('colors'),
				newHTML = '', i;
				for ( i = 0; i < colors.length; i++ ) {
					newHTML += '<div style="background-color: #' + colors[i] + ';"></div>';
				}
				preview.html(newHTML);
			});
		},

		// WordPress media uploader init
		uiApplyUploader: function() {
			var that = this;
			this.jElement.find('.ipt_uif_upload').each(function() {
				var uploader = $(this),
				input = uploader.find('input'),
				preview = uploader.find('div.ipt_uif_upload_bg'),
				button = uploader.find('button.ipt_uif_upload_button'),
				cancel = uploader.find('button.ipt_uif_upload_cancel'),
				filename;

				if ( button.length && input.length ) {
					//Initialize
					filename = input.val();
					preview.hide();
					if ( that.testImage(filename) ) {
						preview.show().find('.ipt_uif_upload_preview').css({backgroundImage : 'url("' + filename + '")'}).show();
					} else if ( filename === '' ) {
						preview.hide().find('.ipt_uif_upload_preview').css({backgroundImage : 'none'});
						cancel.hide();
					}
				}
			});
		},

		// WP color picker
		uiApplyIRIS: function() {
			this.jElement.find('.ipt_uif_colorpicker').wpColorPicker();
		},

		// Conditional input
		uiApplyConditionalInput: function() {
			this.jElement.find('.ipt_uif_conditional_input').each(function() {
				// init vars
				var _self = $(this),
				inputs = _self.find('input'),
				shown = [], hidden = [], input_ids, i;

				// loop through and populate vars
				inputs.each(function() {
					input_ids = $(this).data('condid');
					if ( typeof ( input_ids ) == 'string' ) {
						input_ids = input_ids.split( ',' );
					} else {
						input_ids = [];
					}

					if ( $(this).is(':checked') ) {
						shown.push.apply( shown, input_ids );
					} else {
						hidden.push.apply( hidden, input_ids );
					}
				});

				// hide all that would be hidden
				for ( i = 0; i < hidden.length; i++ ) {
					$('#' + hidden[i]).stop( true, true ).hide();
				}

				// Now show all that would be shown
				for ( i = 0; i < shown.length; i++ ) {
					$('#' + shown[i]).stop( true, true ).show();
				}

			});
		},

		// Conditional Select
		uiApplyConditionalSelect: function() {
			this.jElement.find('.ipt_uif_conditional_select').each(function() {
				// Init the vars
				var _self = $(this),
				select = _self.find('select'),
				shown = [], hidden = [], input_ids, i;

				// Loop through and populate vars
				select.find('option').each(function() {
					input_ids = $(this).data('condid');
					if ( typeof ( input_ids ) == 'string' ) {
						input_ids = input_ids.split( ',' );
					} else {
						input_ids = [];
					}

					if ( $(this).is(':selected') ) {
						shown.push.apply( shown, input_ids );
					} else {
						hidden.push.apply( hidden, input_ids );
					}
				});

				// hide all that would be hidden
				for ( i = 0; i < hidden.length; i++ ) {
					$('#' + hidden[i]).stop( true, true ).hide();
				}

				// Now show all that would be shown
				for ( i = 0; i < shown.length; i++ ) {
					$('#' + shown[i]).stop( true, true ).show();
				}
			});
		},

		// Collapsible
		uiApplyCollapsible: function() {
			this.jElement.find('.ipt_uif_collapsible_handle_anchor').each(function() {
				var self = $(this),
				collapse_wrap = self.closest('.ipt_uif_collapsible'),
				collapse_box = collapse_wrap.find('> .ipt_uif_collapsed');
				if ( collapse_wrap.data('opened') == 1 ) {
					collapse_box.show();
					self.addClass('ipt_uif_collapsible_open');
				} else {
					collapse_box.hide();
					self.removeClass('ipt_uif_collapsible_open');
				}
			});
		},

		// Tabs
		uiApplyTabs: function() {
			this.jElement.find('.ipt_uif_tabs').each(function() {
				var thisTab = $( this );
				// Apply UI tabs
				thisTab.tabs({
					collapsible: thisTab.data('collapsible')
				});

				// Fix for vertical tabs
				if ( thisTab.hasClass('vertical') ) {
					thisTab.addClass('ui-tabs-vertical ui-helper-clearfix');
					thisTab.find('> ul > li').removeClass('ui-corner-top').addClass('ui-corner-left');
				}

				// Check for preactive tab
				thisTab.find( 'li[data-preactive="true"]' ).each( function() {
					$( this ).find( 'a' ).trigger( 'click' );
				} );
			});
		},

		// SDA initiator
		uiSDAinit: function() {
			var self = $(this),
			submit_button = self.find('> .ipt_uif_sda_foot button.ipt_uif_sda_button'),

			// Get some variables
			vars = {
				sort : self.data('draggable') == 1 ? true : false,
				add : self.data('addable') == 1 ? true : false,
				del : self.data('addable') == 1 ? true : false,
				count : (submit_button.length && submit_button.data('count') ? submit_button.data('count') : 0),
				key : (submit_button.length && submit_button.data('key') ? submit_button.data('key') : '__KEY__'),
				confirmDel : (submit_button.length && submit_button.data('confirm') ? submit_button.data('confirm') : 'Are you sure you want to delete? This can not be undone.'),
				confirmTitle : (submit_button.length && submit_button.data('confirmtitle') ? submit_button.data('confirmtitle') : 'Confirmation of Deletion')
			};

			var totalItems = self.find( '> .ipt_uif_sda_body > .ipt_uif_sda_elem' ).length;
			if ( 0 == totalItems ) {
				self.addClass( 'ipt-uif-sda-empty' );
			} else {
				self.removeClass( 'ipt-uif-sda-empty' );
			}

			// store the data
			self.data( 'iptSDAdata', vars );
		},

		// SDA List make sortable
		uiSDAsort: function() {
			var self = $(this),
			sdaData = self.data('iptSDAdata');
			if ( sdaData.sort === true ) {
				self.find('> .ipt_uif_sda_body').sortable({
					items : 'div.ipt_uif_sda_elem',
					placeholder : 'ipt_uif_sda_highlight',
					handle : 'div.ipt_uif_sda_drag',
					distance : 5,
					axis : 'y',
					start: function( event, ui ) {
						ui.placeholder.height( ui.item.outerHeight() );
					},
					helper : 'original',
					cursor: 'move',
					appendTo: self.closest( '.ipt_uif_sda_body' )
					// items : 'div.ipt_uif_sda_elem',
					// placeholder : 'ipt_uif_sda_highlight',
					// handle : 'div.ipt_uif_sda_drag',
					// distance : 5,
					// axis : 'y',
					// helper : 'original'
				});
			}
		},

		/**
		 * Initialize event delegated functionalities
		 * Needs to be initialized only once
		 *
		 * @method     initUIElementsDelegated
		 */
		initUIElementsDelegated: function() {
			var _self = this;
			// Initialize the help toggler
			this.edApplyHelp();

			// Initialize the checkbox toggler
			this.edCheckboxToggler();

			// Initialize the slider listener
			this.edSliderInput();

			// Initialize the datetime Now
			this.edDateTimeNow();

			// Initialize the print element
			this.edApplyPrintElement();

			// Initialize the font selector
			this.edApplyFontSelector();

			// Initialize the theme selector
			this.edApplyThemeSelector();

			// Initialize the uploader
			this.edApplyUploader();

			// Initialize conditional input and select
			this.edApplyConditionalInput();
			this.edApplyConditionalSelect();

			// Initialize collapsible
			this.edApplyCollapsible();

			// Initialize delete confirmer
			this.edApplyDeleteConfirm();

			// Initialize Dismiss Message
			this.edApplyMessageDismiss();

			// Initialize Text Count
			this.edApplyTextCount();

			// Initialize the form save
			this.edApplyFormSubmit();
		},

		// Form Submit
		edApplyFormSubmit: function() {
			var that = this;
			this.jElement.on( 'submit', '.wpq-sp-backoffice-form-ajax', function( e ) {
				// Don't let browser submit
				e.preventDefault();
				// Get our variables
				var form = $( this ),
				ajaxLoader = that.jElement.find( '#wpq-sp-backoffice-form-ajax-loader' ),
				data = form.serialize();
				// Show the ajaxLoader
				ajaxLoader.fadeIn( 'fast' );
				$.post( ajaxurl, data, function( response, textStatus, xhr ) {
					var message =
						$( '<div class="ipt_uif_message ' + ( 'success' == response.status ? 'green' : 'red' ) + '">' +
							'<a href="javascript:;" class="ipt_uif_message_dismiss" title="' + initWPQSPUI.L10n.dismiss + '">&times;</a>' +
							'<p>' + response.msg + '</p>' +
						'</div>' );
					if ( form.find( '.ipt_uif_page_buttons' ).length ) {
						form.find( '.ipt_uif_page_buttons' ).after( message );
					} else {
						that.jElement.find( '.ipt-ui-backoffice-main-wrap' ).prepend( message );
					}

					if ( 'success' == response.status ) {
						setTimeout( function() {
							message.fadeOut( 'fast', function() {
								message.remove();
							} );
						}, 2000 );
					}
				} ).fail( function( xhr, textStatus, errorThrown ) {
					alert( 'HTTP AJAX Error!' );
					if ( console && console.log ) {
						console.log( textStatus, errorThrown );
					}
				} ).always( function() {
					ajaxLoader.fadeOut( 'fast' );
				} );
			} );
		},

		// Text Count
		edApplyTextCount: function() {
			this.jElement.on( 'input change autocompleteselect', '.ipt_uif_textcount', function() {
				var elm = $( this ),
				val = elm.val(),
				length = val.length;
				elm.next( '.ipt_uif_textcount_span' ).html( length );
			} );
		},

		// Dismiss Message
		edApplyMessageDismiss: function() {
			this.jElement.on( 'click', '.ipt_uif_message_dismiss', function( e ) {
				e.preventDefault();
				$( this ).closest( '.ipt_uif_message' ).fadeOut( 'fast' );
			} );
		},

		// Help Toggler
		edApplyHelp: function(e) {
			this.jElement.on( 'click', '.ipt_uif_msg', function(e) {
				e.preventDefault();
				var trigger = $(this).find('.ipt_uif_msg_icon'),
				title = trigger.attr('title'),
				temp, dialog_content;

				if( undefined === title || '' === title ) {
					if( undefined !== ( temp = trigger.parent().parent().siblings('th').find('label').html() ) ) {
						title = temp;
					} else {
						title = initWPQSPUI.L10n.help;
					}
				}

				dialog_content = $('<div>'  + trigger.next('.ipt_uif_msg_body').html() + '</div>');
				var buttons = {};
				buttons[initWPQSPUI.L10n.got_it] = function() {
					$(this).dialog("close");
				};
				dialog_content.dialog({
					autoOpen: true,
					buttons: buttons,
					modal: true,
					minWidth: 600,
					closeOnEscape: true,
					title: title,
					//appendTo : '.ipt_uif_common',
					create : function(event, ui) {
						$('body').addClass('ipt_uif_common');
					},
					close : function(event, ui) {
						$('body').removeClass('ipt_uif_common');
					}
				});
			} );
		},

		// Checkbox Toggler
		edCheckboxToggler: function() {
			// Apply the delegated listen to the change event
			this.jElement.on( 'change', '.ipt_uif_checkbox_toggler', function() {
				var selector = $($(this).data('selector')),
				self = $(this);
				if(self.is(':checked')) {
					selector.prop('checked', true).trigger('change');
				} else {
					selector.prop('checked', false).trigger('change');
				}
			} );
		},

		// Slider input event
		edSliderInput: function() {
			// Listen to the first input change
			this.jElement.on( 'change', '.ipt_uif_slider', function() {
				var _self = $(this), second_input, slider, count_div = _self.prev('.ipt_uif_slider_count');
				// If it is a range
				if ( _self.hasClass('slider_range') ) {
					second_input = _self.next('.ipt_uif_slider_range_max');
					slider = second_input.next('.ipt_uif_slider_div');
					slider.slider({
						values : [parseFloat(_self.val()), parseFloat(second_input.val())]
					});
					count_div.find('span.ipt_uif_slider_count_min').text( parseFloat( _self.val() ) );
				// If it is a slider
				} else {
					slider = _self.next('.ipt_uif_slider_div');
					slider.slider({
						value : parseFloat(_self.val())
					});
					count_div.find('span').text(parseFloat(_self.val()));
				}
			} );

			// Listen to the second input change
			this.jElement.on( 'change', '.ipt_uif_slider_range_max', function() {
				var _self = $(this),
				first_input = _self.prev('.ipt_uif_slider'),
				slider = _self.next('.ipt_uif_slider_div'),
				count_div = first_input.prev('.ipt_uif_slider_count');
				slider.slider({
					values : [parseFloat(first_input.val()), parseFloat(_self.val())]
				});
				count_div.find('span.ipt_uif_slider_count_max').text( parseFloat( _self.val() ) );
			} );
		},

		// DateTime NOW Button
		edDateTimeNow: function() {
			this.jElement.on( 'click', '.ipt_uif_datepicker_now', function() {
				$(this).nextAll('.ipt_uif_text').val('NOW');
			} );
		},

		// Print element
		edApplyPrintElement: function() {
			this.jElement.on( 'click', '.ipt_uif_printelement', function() {
				$('#' + $(this).data('printid')).printElement({
					leaveOpen:true,
					printMode:'popup',
					pageTitle : document.title
				});
			} );
		},

		// Font selector
		edApplyFontSelector: function() {
			this.jElement.on( 'change keyup', '.ipt_uif_font_selector select', function(e) {
				var select = $(this),
				preview = select.closest('.ipt_uif_font_selector').find('.ipt_uif_font_preview').eq(0),
				selected = select.find('option:selected'),
				font_suffix = selected.data('fontinclude'),
				font_key = selected.val(),
				font_family = selected.text();

				// Attach the link
				if ( ! $('#ipt_uif_webfont_' + font_key).length ) {
					$('<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=' + font_suffix + '" id="ipt_uif_webfont_' + font_key + '" />').appendTo('head');
				}

				//Change the font family
				preview.css({fontFamily : font_family});
			} );
		},

		// Theme Selector
		edApplyThemeSelector: function() {
			this.jElement.on( 'change keyup', '.ipt_uif_theme_selector', function() {
				var select = $(this),
				preview = select.next('.ipt_uif_theme_preview'),
				selected = select.find('option:selected'),
				colors = selected.data('colors'),
				newHTML = '', i;
				preview.html('');
				for (i = 0; i < colors.length; i++) {
					newHTML += '<div style="background-color: #' + colors[i] + ';"></div>';
				}
				preview.html(newHTML);
			} );
		},

		edApplyUploader: function() {
			//.ipt_uif_upload
			var that = this;

			// do for the preview
			this.jElement.on( 'click', '.ipt_uif_upload .ipt_uif_upload_preview', function() {
				var uploader = $(this).closest( '.ipt_uif_upload' ),
				input = uploader.find('input');

				tb_show('', input.val() + '?TB_iframe=true');
			} );

			// Do for the cancel
			this.jElement.on( 'click', '.ipt_uif_upload .ipt_uif_upload_cancel', function(e) {
				e.preventDefault();

				var uploader = $(this).closest( '.ipt_uif_upload' ),
				input = uploader.find('input'),
				preview = uploader.find('div.ipt_uif_upload_bg'),
				button = uploader.find('button.ipt_uif_upload_button'),
				cancel = uploader.find('button.ipt_uif_upload_cancel'),
				download = uploader.find('a');

				// Remove the input value
				input.val('');
				preview.hide();
				download.hide();
				cancel.hide();
			} );

			// Do for the text
			this.jElement.on( 'change', '.ipt_uif_upload .ipt_uif_text', function() {
				var uploader = $( this ).closest( '.ipt_uif_upload' ),
				preview = uploader.find('div.ipt_uif_upload_bg');

				preview.show().find('.ipt_uif_upload_preview').css({
					backgroundImage: 'url("' + $( this ).val() + '")'
				});
			} );


			// Do for the upload button
			this.jElement.on( 'click', '.ipt_uif_upload button.ipt_uif_upload_button', function(e) {
				e.preventDefault();

				var uploader = $(this).closest( '.ipt_uif_upload' ),
				input = uploader.find('input'),
				preview = uploader.find('div.ipt_uif_upload_bg'),
				button = uploader.find('button.ipt_uif_upload_button'),
				cancel = uploader.find('button.ipt_uif_upload_cancel'),
				filename,
				ipt_uif_wp_media_frame = uploader.data('iptUIFwpMediaFrame'),
				// Set the reference variables
				wp_media_reference = {
					input : input,
					preview : preview,
					self : button,
					cancel: cancel
				};

				// If wp_media already exists
				if ( ipt_uif_wp_media_frame ) {
					ipt_uif_wp_media_frame.open();
					return;
				}

				// It was not present
				// So let us create one
				ipt_uif_wp_media_frame = wp.media.frames.ipt_uif_wp_media_frame = wp.media({
					title : input.data('title'),
					button : {
						text : input.data('select')
					},
					multiple : false
				});

				// Bind the select event
				ipt_uif_wp_media_frame.on( 'select', function() {
					var attachment = ipt_uif_wp_media_frame.state().get('selection').first().toJSON(),
					associated_title_elem;

					wp_media_reference.preview.hide();

					if ( that.testImage(attachment.url) ) {
						wp_media_reference.preview.show().find('.ipt_uif_upload_preview').css({backgroundImage : 'url("' + attachment.url + '")'});
					} else if (attachment.url === '') {
						wp_media_reference.preview.hide().find('.ipt_uif_upload_preview').css({backgroundImage : 'none'});
					}

					//Change the input value
					wp_media_reference.input.val(attachment.url);

					//Check to see if title is associated
					associated_title_elem = wp_media_reference.input.data('settitle');
					if ( associated_title_elem !== undefined && $( '#' + associated_title_elem ).length ) {
						$('#' + associated_title_elem).val(attachment.title);
					}

					// Show the cancel button
					wp_media_reference.cancel.show();
				} );

				// open it
				ipt_uif_wp_media_frame.open();

				// save it
				uploader.data( 'iptUIFwpMediaFrame', ipt_uif_wp_media_frame );
			} );

		},

		// Conditional Input
		edApplyConditionalInput: function() {
			this.jElement.on( 'change', '.ipt_uif_conditional_input', function(e) {
				// init vars
				var _self = $(this),
				inputs = _self.find('input'),
				shown = [], hidden = [], input_ids, i;

				// loop through and populate vars
				inputs.each(function() {
					input_ids = $(this).data('condid');
					if ( typeof ( input_ids ) == 'string' ) {
						input_ids = input_ids.split( ',' );
					} else {
						input_ids = [];
					}

					if ( $(this).is(':checked') ) {
						shown.push.apply( shown, input_ids );
					} else {
						hidden.push.apply( hidden, input_ids );
					}
				});

				// hide all that would be hidden
				for ( i = 0; i < hidden.length; i++ ) {
					$('#' + hidden[i]).stop( true, true ).hide();
				}

				// Now show all that would be shown
				for ( i = 0; i < shown.length; i++ ) {
					$('#' + shown[i]).stop( true, true ).fadeIn('fast');
				}

			} );
		},

		// Conditional Select
		edApplyConditionalSelect: function() {
			this.jElement.on( 'change keyup', '.ipt_uif_conditional_select', function(e) {
				// Init the vars
				var _self = $(this),
				select = _self.find('select'),
				shown = [], hidden = [], input_ids, i;

				// Loop through and populate vars
				select.find('option').each(function() {
					input_ids = $(this).data('condid');
					if ( typeof ( input_ids ) == 'string' ) {
						input_ids = input_ids.split( ',' );
					} else {
						input_ids = [];
					}

					if ( $(this).is(':selected') ) {
						shown.push.apply( shown, input_ids );
					} else {
						hidden.push.apply( hidden, input_ids );
					}
				});

				// hide all that would be hidden
				for ( i = 0; i < hidden.length; i++ ) {
					$('#' + hidden[i]).stop( true, true ).hide();
				}

				// Now show all that would be shown
				for ( i = 0; i < shown.length; i++ ) {
					$('#' + shown[i]).stop( true, true ).fadeIn('fast');
				}
			} );
		},

		// Collapsible
		edApplyCollapsible: function() {
			this.jElement.on( 'click', '.ipt_uif_collapsible_handle_anchor', function(e) {
				var self = $(this),
				collapse_box = self.closest('.ipt_uif_collapsible').find('> .ipt_uif_collapsed');
				self.toggleClass('ipt_uif_collapsible_open');
				collapse_box.slideToggle('normal');
			} );
		},

		// Delete confirmer
		edApplyDeleteConfirm: function() {
			this.jElement.on( 'click', '.wp-list-table a.delete', function(e) {
				e.preventDefault();
				var self = $(this);
				$('<div>' + initWPQSPUI.L10n.delete_msg + '</div>').dialog({
					autoOpen : true,
					modal : true,
					minWidth : 400,
					closeOnEscape : true,
					title : initWPQSPUI.L10n.delete_title,
					buttons : {
						Confirm : function() {
							window.location.href = self.attr('href');
							$(this).dialog('close');
						},
						Cancel : function() {
							$(this).dialog('close');
						}
					},
					//appendTo : '.ipt_uif_common',
					create : function(event, ui) {
						$('body').addClass('ipt_uif_common');
					},
					close : function(event, ui) {
						$('body').removeClass('ipt_uif_common');
					}
				});
			} );
		},

		// Delete button functionality for SDA
		edSDAattachDel: function() {
			var that = this;
			this.jElement.on( 'click', '.ipt_uif_sda_del', function(e) {
				e.preventDefault();
				var self = $(this),
				vars = self.closest('.ipt_uif_sda').data('iptSDAdata'),
				dialog = $('<p>' + vars.confirmDel + '</p>');
				dialog.dialog({
					autoOpen : true,
					modal : true,
					minWidth : 400,
					closeOnEscape : true,
					title : vars.confirmTitle,
					buttons : {
						Confirm : function() {
							that.edSDAdel.apply(self);
							$(this).dialog('close');
						},
						Cancel : function() {
							$(this).dialog('close');
						}
					},
					//appendTo : '.ipt_uif_common',
					create : function(event, ui) {
						$('body').addClass('ipt_uif_common');
					},
					close : function(event, ui) {
						$('body').removeClass('ipt_uif_common');
					}
				});
			} );
		},
		edSDAdel: function() {
			var target = $(this).closest( '.ipt_uif_sda_elem' ),
			sdaItem = $( this ).closest( '.ipt_uif_sda' );
			target.slideUp('normal');
			target.css('background-color', '#ffaaaa').animate({'background-color' : '#ffffff'}, 'normal', function() {
				target.stop().remove();
				var totalItems = sdaItem.find( '> .ipt_uif_sda_body > .ipt_uif_sda_elem' ).length;
				if ( 0 == totalItems ) {
					sdaItem.addClass( 'ipt-uif-sda-empty' );
				} else {
					sdaItem.removeClass( 'ipt-uif-sda-empty' );
				}
				sdaItem.trigger( 'SDADelete.eform' );
			});
		},

		// Add button functionality for SDA
		edSDAattachAdd: function() {
			//.ipt_uif_sda_foot button.ipt_uif_sda_button
			var that = this;
			this.jElement.on( 'click', '.ipt_uif_sda_foot button.ipt_uif_sda_button', function(e) {
				e.preventDefault();
				var self = $(this),
				sdaItem = self.closest('.ipt_uif_sda'),
				vars = sdaItem.data('iptSDAdata'),
				add_string = sdaItem.find('> .ipt_uif_sda_data').text(),
				count = vars.count++,
				re = new RegExp( that.quote(vars.key), 'g' ), new_div, old_color;

				// Modify the element HTML
				add_string = $('<div></div>').html(add_string).text();
				add_string = add_string.replace( re, count );

				// Add the element HTML to a new DOM
				new_div = $('<div class="ipt_uif_sda_elem"></div>').append(add_string);

				// Append to the SDA body
				sdaItem.find('> .ipt_uif_sda_body').append(new_div);

				// Apply the UI framework
				new_div.initWPQSPUI({
					applyUIOnly: true
				});

				new_div.find( 'input, textarea, select' ).eq( 0 ).focus();

				// Animate the color
				old_color = new_div.css('background-color');

				new_div.hide().slideDown('fast').css('background-color', '#aaffaa').animate( {'background-color' : old_color}, 'normal', function() {
					sdaItem.trigger( 'SDAAdd.eform' );
				} );

				self.data( 'count', vars.count );
				self.attr( 'data-count', vars.count );

				var totalItems = sdaItem.find( '> .ipt_uif_sda_body > .ipt_uif_sda_elem' ).length;
				if ( 0 == totalItems ) {
					sdaItem.addClass( 'ipt-uif-sda-empty' );
				} else {
					sdaItem.removeClass( 'ipt-uif-sda-empty' );
				}
			} );
		},


		/**
		 * Other functions
		 *
		 * @internal
		 */
		testImage : function(filename) {
			return (/\.(gif|jpg|jpeg|tiff|png)$/i).test(filename);
		},

		quote : function(str) {
			return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
		},

		stripTags: function( string ) {
			var tempDOM = $('<div />'),
			stripped = '';
			tempDOM.html(string);
			stripped = tempDOM.text();
			tempDOM.remove();
			return stripped;
		},

		yourOtherFunction: function () {
			// some logic
		}
	};

	var methods = {
		init: function( options ) {
			return this.each(function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
				}
			});
		},
		reinitTBAnchors : function() {
			var tbWindow = $('#TB_window'), width = $(window).width(), H = $(window).height(), W = ( 1024 < width ) ? 1024 : width, adminbar_height = 0;

			if ( $('body.admin-bar').length ) {
				adminbar_height = 28;
			}

			if ( tbWindow.length ) {
					tbWindow.width( W - 50 ).height( H - 45 - adminbar_height );
					$('#TB_iframeContent').width( W - 50 ).height( H - 75 - adminbar_height );
					$('#TB_ajaxContent').width( W - 80 ).height( H - 95 - adminbar_height );
					tbWindow.css({'margin-left': '-' + parseInt((( W - 50 ) / 2),10) + 'px'});
					if ( typeof document.body.style.maxWidth != 'undefined' ) {
						tbWindow.css({'top': 20 + adminbar_height + 'px','margin-top':'0'});
					}
			}

			return $('a.thickbox').each( function() {
					var href = $(this).attr('href');
					if ( ! href ) {
						return;
					}
					href = href.replace(/&width=[0-9]+/g, '');
					href = href.replace(/&height=[0-9]+/g, '');
					$(this).attr( 'href', href + '&width=' + ( W - 80 ) + '&height=' + ( H - 85 - adminbar_height ) );
			});
		}
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function ( method ) {
		if( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
		} else if ( typeof( method ) == 'object' || !method ) {
			methods.init.apply(this, arguments);
		} else {
			$.error( 'Method ' + method + ' does not exist on jQuery.' + pluginName );
		}

		// chain jQuery functions
		return this;
	};

})( jQuery, window, document );

jQuery( document ).ready( function( $ ) {
	$( '.wpq-sp-backoffice' ).initWPQSPUI();
	$( document ).initWPQSPUI( 'reinitTBAnchors' );
	var elm = $( '.wpq-sp-admin-ui' );
	if ( elm.length ) {
		// Show the stuff
		elm.find( '.ipt-ui-backoffice-main-wrap' ).fadeIn( 'fast' );
		// Hide the Loader
		elm.find( '#wpq-sp-backoffice-init-ajax-loader' ).hide();
	}

	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) {
					func.apply(context, args);
				}
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
				func.apply(context, args);
			}
		};
	}
	$( window ).on( 'resize', debounce( function() {
		$(document).initWPQSPUI('reinitTBAnchors');
	}, 250 ) );
} );
