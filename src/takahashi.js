/* takahashi.js (moved to src/)
   Original author: ono hiroko (kuanyui)
   Minimal modifications: path updates for moved markdown & styles.
*/

onload = function() {
    var markdownFile = 'slides/source.md';

    function Parser(markdownFileUrl) {
        this.markdownFileUrl = markdownFileUrl;
        this.parsed = this.parse(markdownFileUrl);
    };

    Parser.prototype.getMarkdownFileContentAsString = function () {
        var r = new XMLHttpRequest();
        r.open("GET", this.markdownFileUrl,false);
        r.overrideMimeType('text/plain; charset=utf-8');
        r.send();
        if (r.readyState == 4 && r.status == 200){
            return r.responseText;
        } else {
            throw new Error("Failed to load markdown (" + this.markdownFileUrl + ") status=" + r.status);
        };
    };

    Parser.prototype.readLines = function(){
        return this.getMarkdownFileContentAsString().split("\n");
    };

    Parser.prototype.parse = function(){
        var lines = this.readLines();
        this.parsed = this.__parse(lines, []);
        return this.parsed;
    };

    Parser.prototype.__parse = function(lines, parsed){
        var imagePattern = /!\[\]\((.+?)\)/;
        if (lines.length === 0) { return parsed; }
        var head = lines[0];
        if (head === "") { return this.__parse(lines.slice(1), parsed); }
        if (head.substring(0, 6) === "# ![](") {
            var imgUrl = head.match(imagePattern)[1];
            parsed.push({type: "fullscreen-image", imgUrl: imgUrl});
            return this.__parse(lines.slice(1), parsed);
        }
        if (head.substring(0, 4) === "![](") {
            var imgUrl2 = head.match(imagePattern)[1];
            parsed[parsed.length - 1].type = "image-and-title";
            parsed[parsed.length - 1].imgUrl = imgUrl2;
            return this.__parse(lines.slice(1), parsed);
        }
        if (head.substring(0, 2) === "# ") {
            parsed.push({type: "normal", title: processEmphasisMarks(head.substring(2))});
            return this.__parse(lines.slice(1), parsed);
        }
        if (head.substring(0, 2) === "- ") {
            parsed[parsed.length - 1].subtitle = processEmphasisMarks(head.substring(2));
            return this.__parse(lines.slice(1), parsed);
        }
        if (head.substring(0, 3) === "```") {
            var language = head.substring(3);
            parsed.push({type: "codeblock", language: language, code: ""});
            return processCodeBlock.call(this, lines.slice(1), parsed);
        }
        return this.__parse(lines.slice(1), parsed);
    };

    function processCodeBlock(lines, parsed){
        if (lines[0].substring(0,3) === "```") {
            var code = parsed[parsed.length - 1].code;
            parsed[parsed.length - 1].code = code.substring(0, code.length - 1);
            return this.__parse(lines.slice(1), parsed);
        }
        parsed[parsed.length - 1].code += lines[0] + "\n";
        return processCodeBlock.call(this, lines.slice(1), parsed);
    }

    function processEmphasisMarks(string) {
        var italic = /\*(.+?)\*/g;
        var bold   = /\*\*(.+?)\*\*/g;
        var strike = /\+(.+?)\+/g;
        var newline = /\\\\/g;
        var output = string.replace(bold, "<b>$1</b>");
        output = output.replace(italic, "<i>$1</i>");
        output = output.replace(strike, "<s>$1</s>");
        return output.replace(newline, "<br/>");
    }

    var availablePageNumbers = [];
    var currentPageNumber = 0;

    function generateSlides() {
        var $slides = document.getElementsByTagName("slides")[0];
        var parser = new Parser(markdownFile);
        var slidesData = parser.parsed;
        for (var i = 0; i < slidesData.length; i++){
            availablePageNumbers.push(i);
            var slideData = slidesData[i];
            var $slide = document.createElement("slide");
            $slide.id = i;
            $slide.className = slideData.type;
            if (slideData.subtitle){ $slide.innerHTML += "<h2>" + slideData.subtitle + "</h2>"; }
            if (slideData.title){ $slide.innerHTML += "<h1>" + slideData.title + "</h1>"; }
            if (slideData.type==="fullscreen-image"){ $slide.innerHTML += "<img class='fullscreen-image' src='" + slideData.imgUrl + "'></img>"; }
            if (slideData.type==="image-and-title"){ $slide.innerHTML += "<img class='image-and-title' src='" + slideData.imgUrl + "'></img>"; }
            if (slideData.type==="codeblock"){ $slide.innerHTML += "<pre><code class='" + slideData.language + "'>" + slideData.code + "</code></pre>"; }
            var $h1 = $slide.getElementsByTagName("h1")[0]; if ($h1) {fitH1($h1);} 
            var $h2 = $slide.getElementsByTagName("h2")[0]; if ($h2) {fitH2($h2);} 
            document.getElementsByTagName("slides")[0].appendChild($slide);
            fitSlide($slide);
        }
    }

    function switchSlide(from, to){
        document.getElementById(from).style.display = "none";
        document.getElementById(to).style.display = "block";
        document.getElementById(to).style.opacity = 0;
        currentPageNumber = to;
        location.hash = to;
        render(to)
    }

    function render(pageN){
        var $slide = document.getElementById(pageN);
        var $h1 = $slide.getElementsByTagName("h1")[0] || null;
        var $h2 = $slide.getElementsByTagName("h2")[0] || null;
        var $img = $slide.getElementsByTagName("img")[0] || null;
        var $block = $slide.getElementsByTagName("pre")[0] || null;
        if ($h2) {
            var h2size = parseInt($h2.style.fontSize) || 60;
            while ($h2.offsetHeight > getSlideHeight() || $h2.offsetWidth > getSlideWidth()) {
                h2size *= 0.95; $h2.style.fontSize = h2size + "px";
            }
        }
        if ($h1) {
            var h1Size = parseInt($h1.style.fontSize) || 80;
            while ($h1.offsetHeight > getSlideHeight() || $h1.offsetWidth > getSlideWidth()) {
                h1Size *= 0.95; $h1.style.fontSize = h1Size + "px";
            }
            if ($h2) {
                if ($img) {
                    $h2.style.top = "10px";
                    $h1.style.top = ($h2.offsetTop + $h2.offsetHeight) + "px";
                } else {
                    if (($h2.offsetTop + $h2.offsetHeight) + $h1.offsetHeight > getSlideHeight()) {
                        $h1.style.top = ($h2.offsetTop + $h2.offsetHeight) + "px";
                        while (($h2.offsetTop + $h2.offsetHeight) + $h1.offsetHeight > getSlideHeight()) {
                            h1Size *= 0.95; $h1.style.fontSize = h1Size + "px";
                        }
                    } else {
                        $h1.style.top = ($h2.offsetTop + $h2.offsetHeight) + (((getSlideHeight() - ($h2.offsetTop + $h2.offsetHeight)) - $h1.offsetHeight) / 2 ) + "px";
                    }
                }
            } else {
                $h1.style.top = ((getSlideHeight() - $h1.offsetHeight) / 2) + "px";
            }
        }
        if ($block) { $block.style.top = ((getSlideHeight() - $block.offsetHeight) / 2) + "px"; }
        $slide.style.opacity = 1;
    }

    function getHtmlStringMaxLineLength(HTMLString){
        return Math.max.apply({}, HTMLString.split("<br>").map(function(line){
            line = line.replace(/<.+?>/g, "");
            line = line.replace(/[\x00-\x7F]{2}/g, "x");
            return line.length;
        }));
    }

    document.onkeydown = function(e){
        var map = {39:1, 37:-1};
        var offset = map[e.which];
        if (offset){
            var to = currentPageNumber + offset;
            if (to in availablePageNumbers){ switchSlide(currentPageNumber, to); }
        }
    };

    document.ontouchstart = function(e){
        if (e.target.href) { return }
        var to = currentPageNumber + (e.touches[0].pageX > innerWidth/2 ? 1 : -1);
        if (to in availablePageNumbers){ switchSlide(currentPageNumber, to); }
    };

    function getSlideHeight(){ return Math.min(window.innerHeight, window.innerWidth); }
    function getSlideWidth(){ return getSlideHeight() * (4/3); }

    function fitSlide($slide){
        var style = $slide.style;
        var min = getSlideHeight();
        style.height = min + "px";
        style.width = (min * 4/3) + "px";
        style.position = "absolute";
        style.margin = '0 auto';
        style.left = 0; style.right = 0;
        style.overflow = 'hidden';
        style.display = "none";
    }
    function fitH2($h2){
        var size = ((getSlideHeight() / getHtmlStringMaxLineLength($h2.innerHTML)) * 1.5);
        var s = $h2.style;
        s.display = "table"; s.position = "absolute"; s.margin = 'auto';
        s.left = 0; s.right = 0; s.top = "20px"; s.fontSize = Math.min(60,size) + "px";
    }
    function fitH1($ele){
        var size = ((getSlideHeight() / getHtmlStringMaxLineLength($ele.innerHTML)) * 1.5);
        var s = $ele.style;
        s.display = "table"; s.position = "absolute"; s.margin = "0 auto"; s.top = "20%"; s.left = 0; s.right = 0; s.fontSize = size + "px";
    }

    function resizeAllImages(){
        var fullscreenImages = document.getElementsByClassName("fullscreen-image");
        for (var i=0;i<fullscreenImages.length;i++){ fullscreenImages[i].style.height = window.innerHeight + "px"; fullscreenImages[i].style.width = "auto"; }
        var images = document.querySelectorAll("img.image-and-title");
        for (var j=0;j<images.length;j++){
            var image = images[j];
            image.style.height = (window.innerHeight * 0.7) + "px";
            image.style.position = "absolute";
            image.style.margin = "auto";
            image.style.bottom = 0; image.style.left = 0; image.style.right = 0;
            var h1 = image.parentNode.getElementsByTagName("h1")[0];
            var h2 = image.parentNode.getElementsByTagName("h2");
            if (h2.length !== 0){ h1.style.top = "48px"; h1.style.fontSize = (getSlideHeight()*0.12) + "px"; }
        }
    }

    function getTextMaxLineLength(text){
        return Math.max.apply(null, text.split("\n").map(function(line){
            line = line.replace(/[\u4e00-\u9faf\u3000-\u30ff\uff00-\uff60\uffe0-\uffe6]/g, "AA");
            return line.length;
        }));
    }

    function main(){
        generateSlides();
        currentPageNumber = location.hash ? parseInt(location.hash.substring(1)) : 0;
        resizeAllImages();
        var codeblocks = document.getElementsByTagName("pre");
        for (var i=0;i<codeblocks.length;i++){
            var block = codeblocks[i];
            var size = ((getSlideHeight() / getTextMaxLineLength(block.textContent)) * 1.8);
            block.style.fontSize = size + "px";
            block.style.position = 'absolute';
            block.style.width = getSlideWidth() + "px";
            block.style.top = "0px";
            hljs.highlightBlock(block);
        }
        switchSlide(0, currentPageNumber);
    }

    main();
};
