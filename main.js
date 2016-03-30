/**
 * Properties
 * Since 2013-11-19 07:43:37
 * @author しふたろう
 */

//canvas
var VIEWMULTI = 2;//キャンバス基本サイズ拡大倍数
var CHIPCELL_SIZE = 8;//基本サイズ1辺り 8*8
var DISPLAY_WIDTH = 256;//キャンバス表示基本幅
var DISPLAY_HEIGHT = 240;//キャンバス表示基本高
var UI_SCREEN_ID = 'screen'; //イベント取得・拡大表示用

var SCROLL_MAX_SPRITES_DRAW = 32; //スプライト最大描画数
var SCROLL_MAX_SPRITES_STACK = 2048; //スプライト最大スタック数

var IMAGE_DIR = './img/'; //画像ファイル読み込みパス(URLフルパスも可)

//wordprint

var WORDPRINT_FONT8PX = 'font8p';
var WORDPRINT_FONT4V6PX = 'font4v6p';
var WORDPRINT_FONT12PX = 'font12p';



//keyevent
var KEYCONTROLL_HOLDTIME = 16; //キー固定判定時間[fps]


var app;

function Rasudai(){
	return;
}
Rasudai.prototype = {
	init: function(){
		this.sprites = {};
		this.testCount = 0;
		this.word8;
		this.keyControll = new KeyControll();
		this.bgPos = {x: 0, y: 0};
		this.colorSwap = false;
		this.reverseEnable = true;
		this.boost = false;
		var self = this;
		makeScroll('bg1', false);
		makeScroll('bg2', false);
		makeScroll('sprite', false);
		makeScroll('tmp', false);
		makeScroll('screen', true);
		
		loadImages([['sprites', 8, 8], [WORDPRINT_FONT8PX, 8, 8]], function(){
			self.keyControll.initDefaultKey();
			self.keyControll.setKey('ext', 16);

			self.word8 = new WordPrint();
			self.word8.init('8px');
			self.initSprites();
			self.initDrawBG();
			requestAnimationFrame(main);
		});
	},
	
	initSprites: function(){
		var spr
			, msq = function(q){return makeSpriteQuery('sprites', q);}
			
		;
		//T:4() - B:12() - H:8
		spr = {
			bg1l: msq(
			 '('
			+ '(1 8 9 10) (0 0) (4 5) (1*3) (2)'
			+ ';(10 0*3) (4 5) (1*4) (2 0)'
			+ ';(0*2) (4 5) (1*5) (2 0 0)'
			+ ';(4 5) (1*6) (2 0*3)'
			+ ';(1*7) (2 0*4)'
			+ ';(1*6) (2 0*5)'
			+ ';(1*5) (2 0*6)'
			+ ';(1*4) (2 0*7)'
			+ ')'
			+ ' (0*4^8)'
			),
			
			bg1r: msq(
				'(1*4^8)'
			+ ' ('
			+ '(3) (0*3) (6 7) (1 1) (11 12 13 0)'
			+ ';(1 3) (0*4) (6 7) (1*3 11)'
			+ ';(1 1 3) (0*5) (6 7) (1*2)'
			+ ';(1*3 3)  (0*6) (6 7) (0*3)'
			+ ';(1*4 3) (0*7) (0*4)'
			+ ';(1*5 3) (0*6) (0*5)'
			+ ';(1*6 3) (0*5) (0*6)'
			+ ';(1*7 3) (0*4) (3 0*7)'
			+ ')'
			),
			bg2l: msq(
				'(18 19 20 21) (27 28 29 30 31) (0*23)'
			+ ';(12 13) (0 0) (18 19 20 21) 1 (27 28 29 30 31) (0*18)'
			+ ';(1 1) (11 12 13) (0*3) (18 19 20 21) (1*2) (27 28 29 30 31) (0*13)'
			+ ';(1*5) (11 12 13) (0*4) (18 19 20 21) (1*3) (27 28 29 30 31) (0*8)'
			+ ';(6 7) (1*6) (11 12 13) (0*5) (18 19 20 21) (1*4) (27 28 29 30 31) (0*3)'
			+ ';(0 0) (6 7) (1*7) (11 12 13) (0*6) (18 19 20 21) (1*5) (27 28 29)'
			+ ';(0*4) (6 7) (1*8) (11 12 13) (0*7) (18 19 20 21) (1*6)'
			+ ';(0*6) (6 7) (1*9) (11 12 13) (0*8) (18 19 20 21) (1)'
			),
			bgbout: msq(
				'63*32^22'
				// '(0*16 1*16)^15'
			),
		};
		
		this.sprites = spr;
	},
	
	initDrawBG: function(){
		var bg1 = scrollByName('bg1')
			, bg2 = scrollByName('bg2')
			, scr = scrollByName('screen')
			;
		bg1.clear(COLOR_BLACK);
		bg1.drawSpriteChunk(this.sprites.bgbout, 0, 0);
		bg1.drawSpriteChunk(this.sprites.bg1l, 0, cellhto(22));
		bg1.drawSpriteChunk(this.sprites.bg1r, cellhto(16), cellhto(22));
		bg1.rasterVolatile = false;
		bg1.x = cellhto(0);
		
		bg2.clear(COLOR_BLACK);
		bg2.drawSpriteChunk(this.sprites.bgbout, 0, 0);
		
		bg2.drawSpriteChunk(this.sprites.bg2l, 0, cellhto(22));
		bg2.rasterVolatile = false;
		bg2.x = bg1.x + DISPLAY_WIDTH;
		
		this.word8.setScroll(bg1);
		this.word8.print('BGOUT', 0, 0);
		this.word8.print('BG1L', 0, cellhto(21));
		this.word8.print('BG1R', cellhto(16), cellhto(21));
		this.word8.setScroll(bg2);
		this.word8.print('BG2L', 0, cellhto(21));
		// this.word8.print('0', 0, cellhto(22));
	},
	
	swapBg: function(enable){
		var L_COLOR = [164, 228, 252, 255]
			, D_COLOR = [60, 188, 252, 255]
			, L2_COLOR = [248, 164, 192, 255]
			, D2_COLOR = [248, 88, 152, 255]
		;
		if(enable){
			swapColorSpriteRecursive(this.sprites.bg2l, 'push', L2_COLOR, L_COLOR);
			swapColorSpriteRecursive(this.sprites.bg2l, 'push', D2_COLOR, D_COLOR);
			swapColorSpriteRecursive(this.sprites.bg2l, 'start');
		}else{
			swapColorSpriteRecursive(this.sprites.bg2l, 'push', L_COLOR, L2_COLOR);
			swapColorSpriteRecursive(this.sprites.bg2l, 'push', D_COLOR, D2_COLOR);
			swapColorSpriteRecursive(this.sprites.bg2l, 'start');
			
		}
		scrollByName('bg2').drawSpriteChunk(this.sprites.bg2l, 0, cellhto(22));

	},
	
	appRaster: function(){
		var cto = cellhto
			, bg1 = scrollByName('bg1')
			, bg2 = scrollByName('bg2')
			, start = cto(22), height = cto(8)
			, topSize = cto(4), bottomSize = cto(12)
			, sizeRate = (bottomSize - topSize) / height
			, revof = topSize
			, tbsub = sizeRate / topSize
			, reversePos, pos
			, i, f = 1, reverseFlag = false
			
			, hCycle = topSize * 2
			, hSpeed = 0.6
			, hcnt =  (hCycle + ((this.bgPos.x * hSpeed) % hCycle)) % hCycle
			, hFlipFlag = ((hcnt / topSize) | 0) == 0 ? 1 : -1
			
			, cellHeight = cto(8)
			, vCycle = cellHeight * 2, diffPow = 0
			, vSpeed = 1.2
			, vcnt = (vCycle + ((this.bgPos.y * vSpeed) % vCycle)) % vCycle
			, vFlipFlag = ((vcnt / cellHeight) | 0) == 0
			, pow = 2
			;
			
		reverseFlag = vFlipFlag;
		this.word8.setScroll(scrollByName('sprite'));
		this.word8.print(vcnt| 0, 0, 152);
		this.word8.print((((vcnt % cellHeight) * (Math.pow(pow, 6) - Math.pow(pow, 5)) / cellHeight))|0, 0, 160);
		// this.word8.print((((Math.pow(pow, 6) - Math.pow(pow, 5)) / cellHeight)), 0, 160);
		for(i = 0; i < start; i++){
			diffPow = Math.pow(pow, f + 1) - Math.pow(pow, f);
			if(i + 2> Math.pow(pow, f) + ((vcnt % cellHeight) * diffPow / cellHeight) + 0){
				reverseFlag = !reverseFlag;
				f += 1;
			}
			
			reversePos = reverseFlag * (topSize + (sizeRate * i)) * hFlipFlag;
			reversePos = this.reverseEnable ? reversePos : 0;
			// reversePos = 0;
			pos = - hcnt - (hcnt * tbsub * i);
			bg1.setRasterHorizon(start + i, Math.round(pos - reversePos), start + i);
			bg2.setRasterHorizon(start + i, Math.round(pos - reversePos), start + i);
			
		}
		this.testCount++;
	},
	
	keyCheck: function()
	{
		var cont = this.keyControll
			, state = cont.getState(['up', 'down', 'left', 'right', 'ext'])
			, trig = cont.getTrig(['select'])
		;
		if(state.left){
			this.bgPos.x -= 1 + this.boost;
		}
		if(state.right){
			this.bgPos.x += 1 + this.boost;
		}
		if(state.up){
			this.bgPos.y += 1 + this.boost;
		}
		if(state.down){
			this.bgPos.y -= 1 + this.boost;
		}
		
		if(state.ext){
			this.boost = true;
		}else{
			this.boost = false;
		}
		
		if(trig.select){
			this.colorSwap = !this.colorSwap;
			this.swapBg(this.colorSwap);
			if(!this.colorSwap){
				this.reverseEnable = !this.reverseEnable;
			}
		}
	},
};

function main(){
	var scrolls = getScrolls();
	app.appRaster();
	drawCanvasStacks();
	app.keyCheck();
	keyStateCheck();
	// scrolls.tmp.clear([60, 188, 252, 255]);
	// scrolls.tmp.clear([164, 228, 252, 255]);
	scrolls.bg1.rasterto(scrolls.tmp);
	scrolls.bg2.rasterto(scrolls.tmp);
	scrolls.sprite.rasterto(scrolls.tmp);
	scrolls.sprite.clear();
	
	screenView(scrolls.screen, scrolls.tmp);
	scrolls.bg1.rasterto(scrolls.screen);
	scrolls.bg2.rasterto(scrolls.screen);
	
	requestAnimationFrame(main);
}


document.addEventListener('DOMContentLoaded', function(){
	app = new Rasudai();
	app.init();
});
