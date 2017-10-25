﻿//// Ce fichier fournit des fonctions utilitaires pour les programmes
//// du cours Synthèse d'images en IMR2 à l'Enssat
//// Ce fichier n'est pas libre de droit car il appartient également à
//// un ouvrage en cours de publication en 2017, donc ne pas diffuser
//// en dehors de ce cours.

/// singleton qui représente la librairie OpenGL
var gl;

/// singleton qui représente le contexte du débogage d'OpenGL (webgl-debug.js)
var ctx;

/**
 * cette fonction affiche une erreur dans la console et lance une exception
 * @author http://jayesh.me
 * @see http://www.codeovertones.com/2011/08/how-to-print-stack-trace-anywhere-in.html
 * @param msg : message d'erreur à afficher
 */
function error(msg)
{
    //alert(msg + "\n=> details are in console");
    console.error(msg);
    // ce qui suit est inutile, car console.error affiche la pile d'exécution
//    let error = new Error(msg);
//    let stack = error.stack
//        .replace(/^[^\(]+?[\n$]/gm, '')
//        .replace(/^\s+at\s+/gm, '')
//        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
//        .split('\n');
    throw msg;
}


/**
 * cette fonction numérote les lignes du texte passé en paramètre
 * @param texte à numéroter
 */
function PrintNumberedLines(texte)
{
    // séparer selon les retours à la ligne
    let lines = texte.split("\n");
    let result = "";
    // parcourir les lignes
    for (let line_number=0; line_number<lines.length; line_number++) {
        result += (line_number+1) + ":\t" + lines[line_number] + "\n";
    }
    console.error(result);
}


// définir la classe Utils
class Utils
{
    /**
     * retourne le temps global, en nombre de secondes écoulées depuis le lancement de l'application
     */
    static getTime()
    {
        return Utils.Time;
    }


    /// cette fonction fait en sorte de rappeler la fonction refresh régulièrement
    static repeatRefresh()
    {
        UpdateTime();
        try {
            refresh();
            requestAnimFrame(Utils.repeatRefresh);
        } catch (erreur) {
            console.error(erreur);
        }
    }


    /**
     * cette fonction compile le source en tant que shader du type indiqué
     * @param shaderType : fournir gl.VERTEX_SHADER ou gl.FRAGMENT_SHADER
     * @param source : fournir un texte contenant le programme à compiler
     * @param name : nom du shader, pour afficher des messages d'erreur ou le log
     * @return l'identifiant OpenGL du shader, null si erreur
     */
    static compileShader(shaderType, source, name)
    {
        // le source est-il l'identifiant d'un div html ?
        let div = document.getElementById(source);
        if (div != null) {
            source = div.innerHTML;
        }

        /*****DEBUG*****/
        if (shaderType != gl.VERTEX_SHADER && shaderType != gl.FRAGMENT_SHADER) {
            error("Utils.compileShader: shader type is neither GL_VERTEX_SHADER or GL_FRAGMENT_SHADER");
        }
        /*****DEBUG*****/

        // compiler le source
            let shader = gl.createShader(shaderType);
        /*****DEBUG*****/
        if (shader == null) {
            error("Utils.compileShader: gl.createShader failed : " + WebGLDebugUtils.glEnumToString(ctx.getError()));
        }
        /*****DEBUG*****/
        if (shader == null) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        // vérifier l'état
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(name+": "+gl.getShaderInfoLog(shader));
            PrintNumberedLines(source);
            error("Utils.compileShader: failed "+name);
        }
        return shader;
    }


    /**
     * cette fonction compile les deux sources, vertex et fragment shader
     * et les relie en tant que programme de shaders complet
     * @param VSsource : source du vertex shader
     * @param FSsource : source du fragment shader
     * @param name : nom du shader pour les messages d'erreurs ou le log
     * @param debug : mettre true si on veut afficher le programme en cas de bonne compilation
     * @return identifiant OpenGL du programme de shader complet, null si erreur
     */
    static makeShaderProgram(VSsource, FSsource, name, debug=false)
    {
        let vertexShader   = Utils.compileShader(gl.VERTEX_SHADER, VSsource, "Vertex Shader of "+name);
        let fragmentShader = Utils.compileShader(gl.FRAGMENT_SHADER, FSsource, "Fragment Shader of "+name);

        // créer un programme et ajouter les deux shaders
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // forcer "glVertex" à être l'attribut 0 (pb si c'est pas comme ça qu'elle s'appelle)
        // voir http://www.opengl.org/wiki/Vertex_Attribute, pour éviter le bug de l'attribut 0 pas lié
        gl.bindAttribLocation(program, 0, "glVertex");

        // lier le programme
        gl.linkProgram(program);

        let status = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!status) {
            let msg = "Unable to link shaders of "+name+"\nCheck varyings between vertex and fragment";
            alert(msg);
            console.error("In "+name+": "+gl.getShaderInfoLog(shader));
            throw msg;
        }

        if (debug) {
            console.log("==============================================================");
            PrintNumberedLines(srcVertexShader);
            console.log("--------------------------------------------------------------");
            PrintNumberedLines(srcFragmentShader);
            console.log("==============================================================");
        }

        return program;
    }


    /**
     * supprime un shader dont on fournit l'identifiant
     * @param id : identifiant du shader
     */
    static deleteShaderProgram(id)
    {
        if (id == null) return;

        // détacher et supprimer tous ses shaders

        // supprimer le programme
        gl.deleteProgram(id);
    }


    /**
     * cette fonction crée un VBO contenant des GLfloat
     * @param values : tableau de float à mettre dans le VBO
     * @param vbo_type : type OpenGL du VBO, par exemple gl.ARRAY_BUFFER
     * @param usage : type de stockage OpenGL des données, par exemple gl.STATIC_DRAW
     * @return identifiant OpenGL du VBO
     */
    static makeFloatVBO(values, vbo_type, usage)
    {
        /*****DEBUG*****/
        if (values.constructor !== Array) {
            error("Utils.makeFloatVBO: values vector is empty");
        }
        if (values.length < 1) {
            error("Utils.makeFloatVBO: values vector is empty");
        }
        if (vbo_type != gl.ARRAY_BUFFER) {
            error("Utils.makeFloatVBO: second parameter, vbo_type is not gl.ARRAY_BUFFER");
        }
        if (usage != gl.STATIC_DRAW && usage != gl.DYNAMIC_DRAW) {
            error("Utils.makeFloatVBO: third parameter, usage is neither gl.STATIC_DRAW or gl.DYNAMIC_DRAW");
        }
        /*****DEBUG*****/
        let buffer = gl.createBuffer();
        gl.bindBuffer(vbo_type, buffer);
        gl.bufferData(vbo_type, new Float32Array(values), usage);
        gl.bindBuffer(vbo_type, null);
        return buffer;
    }


    /**
     * cette fonction crée un VBO contenant des GLshort
     * NB : en WebGL, on ne peut pas utiliser gl.drawElements avec des UNSIGNED_INT
     * @param values : tableau de GLshort à mettre dans le VBO
     * @param vbo_type : type OpenGL du VBO, par exemple gl.ELEMENT_ARRAY_BUFFER
     * @param usage : type de stockage OpenGL des données, par exemple gl.STATIC_DRAW
     * @return identifiant OpenGL du VBO
     */
    static makeShortVBO(values, vbo_type, usage)
    {
        /*****DEBUG*****/
        if (values.constructor !== Array) {
            error("Utils.makeShortVBO: values vector is empty");
        }
        if (values.length < 1) {
            error("Utils.makeShortVBO: values vector is empty");
        }
        if (vbo_type != gl.ARRAY_BUFFER && vbo_type != gl.ELEMENT_ARRAY_BUFFER) {
            error("Utils.makeShortVBO: second parameter, vbo_type is neither gl.ARRAY_BUFFER ou gl.ELEMENT_ARRAY_BUFFER");
        }
        if (usage != gl.STATIC_DRAW && usage != gl.DYNAMIC_DRAW) {
            error("Utils.makeShortVBO: third parameter, usage is neither gl.STATIC_DRAW or gl.DYNAMIC_DRAW");
        }
        /*****DEBUG*****/
        let buffer = gl.createBuffer();
        gl.bindBuffer(vbo_type, buffer);
        gl.bufferData(vbo_type, new Uint16Array(values), usage);
        gl.bindBuffer(vbo_type, null);
        return buffer;
    }


    /**
     * supprime un buffer VBO dont on fournit l'identifiant
     * @param id : identifiant du VBO
     */
    static deleteVBO(id)
    {
        if (id == null) return;

        gl.deleteBuffer(id);
    }


    /**
     * cette fonction lance le chargement d'une image et en fait une texture
     * NB: le chargement est fait par une requête au serveur, donc peut prendre du temps
     * pendant lequel la texture n'est pas utilisable
     * @param filename : nom du fichier contenant l'image à charger
     * @return une texture WebGL
     */
    static loadTexture(filename, modeU=gl.CLAMP_TO_EDGE, modeV=gl.CLAMP_TO_EDGE)
    {
        let texture = gl.createTexture();
        texture.image = new Image();
        texture.image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, modeU);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, modeV);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        texture.image.src = filename;
        return texture;
    }


    /**
     * cette fonction associe une texture à une unité de texture pour un shader
     * NB: le shader concerné doit être actif
     * @param unit : unité de texture concernée, par exemple gl.TEXTURE0
     * @param texture : texture à associer
     * @param locSampler2D : emplacement de la variable uniform sampler2D de cette texture dans le shader
     */
    static setTexture(unit, texture, locSampler2D=null)
    {
        gl.activeTexture(unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if (texture != null && locSampler2D != null) {
            gl.uniform1i(locSampler2D, unit-gl.TEXTURE0);
        }
    }



    /**
     * convertit en radians l'angle fourni en degrés
     * @param deg : angle en degrés
     * @return angle converti en radians
     */
    static radians(deg)
    {
        return deg * Math.PI / 180.0;
    }


    /**
     * convertit en degrés l'angle fourni en radians
     * @param rad : angle en radians
     * @return angle converti en degrés
     */
    static degrees(rad)
    {
        return rad * 180.0 / Math.PI;
    }


    /**
     * cette fonction convertit un vec3(teinte, saturation, valeur) en (rouge, vert, bleu)
     * NB : les composantes sont toutes comprises entre 0 et 1
     * @param hsv : vec3(h,s,v) contenant la teinte à convertir
     * @return vec3(r,v,b)
     */
    static hsv2rgb(hsv)
    {
        let h = (hsv[0] - Math.floor(hsv[0])) * 6.0;
        let s = hsv[1];
        let v = hsv[2];

        if (s <= 0.0) return vec3.fromValues(v,v,v);

        let i = Math.floor(h);
        let ff = h - i;
        let p = v * (1.0 - s);
        let q = v * (1.0 - (s * ff));
        let t = v * (1.0 - (s * (1.0 - ff)));

        switch(i) {
        case 0:
            return vec3.fromValues(v,t,p);
        case 1:
            return vec3.fromValues(q,v,p);
        case 2:
            return vec3.fromValues(p,v,t);
        case 3:
            return vec3.fromValues(p,q,v);
        case 4:
            return vec3.fromValues(t,p,v);
        case 5:
        default:
            return vec3.fromValues(v,p,q);
        }
    }


    /**
     * retourne valeur si elle est comprise entre min et max
     * sinon retourne min ou max selon la borne qui est dépassée
     * @param value : valeur à comparer aux bornes
     * @param min borne inférieure
     * @param max borne supérieure
     * @return valeur ou min ou max, selon les comparaisons
     */
    static clamp(value, min, max)
    {
        if (value <= min) return min;
        if (value >= max) return max;
        return value;
    }
}





/**
 * charge un fichier OBJ
 * NB: c'est fait à l'arrache pour le TP2, ne pas reprendre dans un projet sérieux
 */
function ObjFile(nomfichierobj, callback, that)
{
    this.vertices   = [];
    this.texcoords  = [];
    this.normales   = [];
    this.indices    = [];

    // faire une requête HTTP pour demander le fichier obj
    let request = new XMLHttpRequest();
    request.objfile = this;
    request.open("GET", nomfichierobj);
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            // parcourir le fichier obj ligne par ligne
            var lignes = request.responseText.split('\n');
            for (var l=0; l<lignes.length; l++) {
                var ligne = lignes[l].replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
                var mots = ligne.split(' ');
                if (mots[0] == 'f' && mots.length > 3) {
                    // lire les numéros du premier point
                    var vtn = mots[1].split('/');
                    var nv1 = parseInt(vtn[0])-1;
                    // lire les numéros du deuxième point
                    var vtn = mots[2].split('/');
                    var nv2 = parseInt(vtn[0])-1;
                    // lire et traiter les points suivants
                    for (var i=3; i<mots.length; i++) {
                        var vtn = mots[i].split('/');
                        var nv3 = parseInt(vtn[0])-1;
                        // ajouter un triangle s1,s2,s3
                        this.objfile.indices.push(nv1);
                        this.objfile.indices.push(nv2);
                        this.objfile.indices.push(nv3);
                        // préparer le passage au triangle suivant
                        nv2 = nv3;
                    }
                } else
                if (mots[0] == 'v') {
                    // coordonnées 3D d'un sommet
                    this.objfile.vertices.push(parseFloat(mots[1]));
                    this.objfile.vertices.push(parseFloat(mots[2]));
                    this.objfile.vertices.push(parseFloat(mots[3]));
                } else
                if (mots[0] == 'vt') {
                    // coordonnées de texture
                    this.objfile.texcoords.push(parseFloat(mots[1]));
                    this.objfile.texcoords.push(parseFloat(mots[2]));
                } else
                if (mots[0] == 'vn') {
                    // normale
                    this.objfile.normales.push(parseFloat(mots[1]));
                    this.objfile.normales.push(parseFloat(mots[2]));
                    this.objfile.normales.push(parseFloat(mots[3]));
                }
            }
            callback(that, this.objfile);
        }
    }
    request.onerror = function() {
        alert(nomfichierobj+" ne peut pas être chargé");
    }
    request.send();
}

/// gestion du réaffichage régulier au cours du temps

var InitialTime = Date.now();
Utils.Time = InitialTime;
var TimeChange = true;
var TimePause = 0;


function UpdateTime()
{
    if (TimeChange) {
        Utils.Time = (Date.now() - InitialTime) * 0.001;
    }
}

function PauseTime()
{
    if (TimeChange) {
        TimePause = Date.now();
    } else {
        InitialTime += (Date.now() - TimePause);
    }
    TimeChange = !TimeChange;
}


/// gestion de la souris

// état de la souris
Utils.MouseMode_clicked = -1;
Utils.MouseMode_oldX = 0;
Utils.MouseMode_oldY = 0;


/**
 * cette fonction permet d'appeler la méthode onKeyDown si elle est définie quelque part (base.html)
 * @param event : événement clavier
 */
function onKeyDownInternal(event)
{
    if (typeof(onKeyDown) == "function") {
        onKeyDown(event.keyCode);
    }
}

/**
 * cette fonction permet d'appeler la méthode onKeyUp si elle est définie quelque part (base.html)
 * @param event : événement clavier
 */
function onKeyUpInternal(event)
{
    if (typeof(onKeyUp) == "function") {
        onKeyUp(event.keyCode);
    }
}

/**
 * cette fonction permet d'appeler la méthode onMouseDown si elle est définie quelque part (base.html)
 * @param event : événement souris
 */
function onMouseDownInternal(event)
{
    if (typeof(onMouseDown) == "function") {
    let canvas = document.getElementById("opengl-canvas");
    let rect = canvas.getBoundingClientRect();
    onMouseDown(event.button, event.clientX-rect.left, event.clientY-rect.top);
    }
}

/**
 * cette fonction permet d'appeler la méthode onMouseUp si elle est définie quelque part (base.html)
 * @param event : événement souris
 */
function onMouseUpInternal(event)
{
    if (typeof(onMouseUp) == "function") {
    let canvas = document.getElementById("opengl-canvas");
    let rect = canvas.getBoundingClientRect();
    onMouseUp(event.button, event.clientX-rect.left, event.clientY-rect.top);
    }
}


/**
 * cette fonction permet d'appeler la méthode onMouseMove si elle est définie quelque part (base.html)
 * @param event : événement souris
 */
function onMouseMoveInternal(event)
{
    if (typeof(onMouseMove) == "function") {
    let canvas = document.getElementById("opengl-canvas");
    let rect = canvas.getBoundingClientRect();
    onMouseMove(event.clientX-rect.left, event.clientY-rect.top);
    }
}


/*****DEBUG*****/
 /**
 * cette fonction signale tout paramètre indéfini, par exemple en cas de
 * faute de frappe dans le nom d'une variable.
 * @see https://www.khronos.org/webgl/wiki/Debugging
 * @param function_name : nom de la fonction
 * @params args : valeurs passées en paramètres à la fonction
 */
function checkUndefinedParameters(function_name, args)
{
    for (let ii = 0; ii < args.length; ++ii) {
        if (args[ii] === undefined) {
            let msg = "parametre indefini fourni à gl."+function_name+"("+WebGLDebugUtils.glFunctionArgsToString(function_name, args)+")";
            console.error(msg);
        }
    }
}

/**
 * cette fonction émet une exception quand il y a une erreur OpenGL
 * @param err : code d'erreur OpenGL
 * @param function_name : nom de la fonction
 * @params args : valeurs passées en paramètres à la fonction
 */
function throwOnGLError(err, function_name, args)
{
    let msg = WebGLDebugUtils.glEnumToString(err) + " caused by error in gl." + function_name;
    error(msg);
}
/*****DEBUG*****/



/**
 * initialise le canvas HTML en mode OpenGL
 * active les callbacks clavier et souris
 * @param canvas : celui où il faut afficher l'image OpenGL
 * @param options : dictionnaire d'options
 */
function initGL(canvas, options={})
{
    gl = null;
    try {
        // pas de compositage avec le fond http://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html
        if (!options.hasOwnProperty('premultipliedAlpha')) {
            options.premultipliedAlpha = false;
        }
        // pas de canal alpha sur l'écran
        if (!options.hasOwnProperty('alpha')) {
            options.alpha = false;
        }

        // mettre le canvas en mode OpenGL version WebGL2 et se rabattre sur WebGL1 si pb
        gl = canvas.getContext("webgl2", options) || canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);

        /*****DEBUG*****/
        // en cas d'erreur OpenGL, il y aura un message dans la console
        gldebug = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, checkUndefinedParameters);
        /*****DEBUG*****/

        // taille du canvas OpenGL
        gl.viewportWidth    = canvas.width;
        gl.viewportHeight   = canvas.height;

        // rajouter les callbacks clavier et souris sur le canvas
        document.onkeydown      = onKeyDownInternal;
        document.onkeyup        = onKeyUpInternal;
        canvas.onmousedown      = onMouseDownInternal;
        document.onmouseup      = onMouseUpInternal;
        document.onmousemove    = onMouseMoveInternal;

    } catch (e) {
        console.error(e);
    }

    if (!gl) {
    alert("OpenGL cannot be initialized");
    }
}





/// Constantes diverses

// nombre d'unités par vecteur OpenGL
Utils.FLOAT = 1;
Utils.VEC2 = 2;
Utils.VEC3 = 3;
Utils.VEC4 = 4;

// nombre d'octets des types de données
Utils.SIZEOF_FLOAT = 4;
Utils.SIZEOF_VEC2 = 2 * Utils.SIZEOF_FLOAT;
Utils.SIZEOF_VEC3 = 3 * Utils.SIZEOF_FLOAT;
Utils.SIZEOF_VEC4 = 4 * Utils.SIZEOF_FLOAT;


/// ajout de fonctions à la librairie gl-matrix

if (typeof vec3 == 'undefined') {
    let mesg = "Dependancy order : please first include gl-matrix-min.js before utils.js in "+document.documentURI;
    alert(msg);
    throw msg;
}


vec2.zero = function(out)
{
    out[0] = out[1] = 0.0;
}

vec3.zero = function(out)
{
    out[0] = out[1] = out[2] = 0.0;
}

vec4.zero = function(out)
{
    out[0] = out[1] = out[2] = out[3] = 0.0;
}


/**
 * Calls gl.uniform on the given vec for the location loc
 *
 * @param {int} loc  location of the uniform variable
 * @param {vec2} vec vec2 or array of vec2 to set to the variable
 */
vec2.glUniform = function(loc, vec)
{
    /*****DEBUG*****/
    if (loc == null) {
        return;
        //error("vec2.glUniform: first parameter, loc is null");
    }
    if (loc.constructor !== WebGLUniformLocation) {
        error("vec2.glUniform: first parameter, loc is not a location of uniform variable : "+loc);
    }
    if (vec == null) {
        error("vec2.glUniform: second parameter, vec is null");
    }
    if (vec.constructor == Array) {
        // avec WebGL, il faut aplatir le tableau de vec2 avant de le passer à gl.uniform
        let nbvec2 = vec.length;
        let tmp = new Float32Array(2*nbvec2);
        for (let i=0; i<nbvec2; i++) {
            tmp[i*2+0] = vec[i][0];
            tmp[i*2+1] = vec[i][1];
        }
        vec = tmp;
    } else if (vec.constructor == Float32Array) {
        // cas d'un simple vec2
        if (vec.length !== 2) {
            error("vec2.glUniform: second parameter, vec is not of type vec2 : "+vec);
        }
    } else {
        error("vec2.glUniform: second parameter, vec is not of type vec2 : "+vec);
    }
    /*****DEBUG*****/
    gl.uniform2fv(loc, vec);
}

/**
 * Calls gl.uniform on the given vec for the location loc
 *
 * @param {int} loc  location of the uniform variable
 * @param {vec3} vec vec3 or array of vec3 to set to the variable
 */
vec3.glUniform = function(loc, vec)
{
    /*****DEBUG*****/
    if (loc == null) {
        return;
        //error("vec3.glUniform: first parameter, loc is null");
    }
    if (loc.constructor !== WebGLUniformLocation) {
        error("vec3.glUniform: first parameter, loc is not a location of uniform variable : "+loc);
    }
    if (vec == null) {
        error("vec3.glUniform: second parameter, vec is null");
    }
    if (vec.constructor == Array) {
        // avec WebGL, il faut aplatir le tableau de vec3 avant de le passer à gl.uniform
        let nbvec3 = vec.length;
        let tmp = new Float32Array(3*nbvec3);
        for (let i=0; i<nbvec3; i++) {
            tmp[i*3+0] = vec[i][0];
            tmp[i*3+1] = vec[i][1];
            tmp[i*3+2] = vec[i][2];
        }
        vec = tmp;
    } else if (vec.constructor == Float32Array) {
        // cas d'un simple vec3
        if (vec.length !== 3) {
            error("vec3.glUniform: second parameter, vec is not of type vec3 : "+vec);
        }
    } else {
        error("vec3.glUniform: second parameter, vec is not of type vec3 : "+vec);
    }
    /*****DEBUG*****/
    gl.uniform3fv(loc, vec);
}

/**
 * Calls gl.uniform on the given vec for the location loc
 *
 * @param {int} loc  location of the uniform variable
 * @param {vec4} vec vec4 or array of vec4 to set to the variable
 */
vec4.glUniform = function(loc, vec)
{
    /*****DEBUG*****/
    if (loc == null) {
        return;
        //error("vec4.glUniform: first parameter, loc is null");
    }
    if (loc.constructor !== WebGLUniformLocation) {
        error("vec4.glUniform: first parameter, loc is not a location of uniform variable : "+loc);
    }
    if (vec == null) {
        error("vec4.glUniform: second parameter, vec is null");
    }
    if (vec.constructor == Array) {
        // avec WebGL, il faut aplatir le tableau de vec4 avant de le passer à gl.uniform
        let nbvec4 = vec.length;
        let tmp = new Float32Array(4*nbvec4);
        for (let i=0; i<nbvec4; i++) {
            tmp[i*4+0] = vec[i][0];
            tmp[i*4+1] = vec[i][1];
            tmp[i*4+2] = vec[i][2];
            tmp[i*4+3] = vec[i][3];
        }
        vec = tmp;
    } else if (vec.constructor == Float32Array) {
        // cas d'un simple vec4
        if (vec.length !== 4) {
            error("vec4.glUniform: second parameter, vec is not of type vec4 : "+vec);
        }
    } else {
        error("vec4.glUniform: second parameter, vec is not of type vec4 : "+vec);
    }
    /*****DEBUG*****/
    gl.uniform4fv(loc, vec);
}

/**
 * Calls gl.uniformMatrix on the given mat for the location loc
 *
 * @param {int} loc  location of the uniform variable
 * @param {mat2} mat mat2 to set to the variable
 */
mat2.glUniformMatrix = function(loc, mat)
{
    /*****DEBUG*****/
    if (loc == null) {
        return;
        //error("mat2.glUniformMatrix: first parameter, loc is null");
    }
    if (loc.constructor !== WebGLUniformLocation) {
        error("mat2.glUniformMatrix: first parameter, loc is not a location of uniform variable : "+loc);
    }
    if (mat == null) {
        error("mat2.glUniformMatrix: second parameter, mat is null");
    }
    if (mat.constructor !== Float32Array) {
        error("mat2.glUniformMatrix: second parameter, mat is not of type mat2 : "+mat);
    }
    if (mat.length !== 4) {
        error("mat4.glUniformMatrix: second parameter, mat is not of type mat4 : "+mat);
    }
    /*****DEBUG*****/
    gl.uniformMatrix2fv(loc, gl.FALSE, mat);
}


/**
 * Calls gl.uniformMatrix on the given mat for the location loc
 *
 * @param {int} loc  location of the uniform variable
 * @param {mat3} mat mat3 to set to the variable
 */
mat3.glUniformMatrix = function(loc, mat)
{
    /*****DEBUG*****/
    if (loc == null) {
        return;
        //error("mat3.glUniformMatrix: first parameter, loc is null");
    }
    if (loc.constructor !== WebGLUniformLocation) {
        error("mat3.glUniformMatrix: first parameter, loc is not a location of uniform variable : "+loc);
    }
    if (mat == null) {
        error("mat3.glUniformMatrix: second parameter, mat is null");
    }
    if (mat.constructor !== Float32Array) {
        error("mat3.glUniformMatrix: second parameter, mat is not of type mat3 : "+mat);
    }
    if (mat.length !== 9) {
        error("mat4.glUniformMatrix: second parameter, mat is not of type mat4 : "+mat);
    }
    /*****DEBUG*****/
    gl.uniformMatrix3fv(loc, gl.FALSE, mat);
}


/**
 * Calls gl.uniformMatrix on the given mat for the location loc
 *
 * @param {int} loc  location of the uniform variable
 * @param {mat4} mat mat4 to set to the variable
 */
mat4.glUniformMatrix = function(loc, mat)
{
    /*****DEBUG*****/
    if (loc == null) {
        return;
        //error("mat4.glUniformMatrix: first parameter, loc is null");
    }
    if (loc.constructor !== WebGLUniformLocation) {
        error("mat4.glUniformMatrix: first parameter, loc is not a location of uniform variable : "+loc);
    }
    if (mat == null) {
        error("mat4.glUniformMatrix: second parameter, mat is null");
    }
    if (mat.constructor !== Float32Array) {
        error("mat4.glUniformMatrix: second parameter, mat is not of type mat4 : "+mat);
    }
    if (mat.length !== 16) {
        error("mat4.glUniformMatrix: second parameter, mat is not of type mat4 : "+mat);
    }
    /*****DEBUG*****/
    gl.uniformMatrix4fv(loc, gl.FALSE, mat);
}

/**
 * Creates a new vec2 initialized from the given vec
 *
 * @param {vec2 or vec3 or vec4} a
 * @returns {vec3} a new 4D vector
 */
vec2.fromVec = function(a) {
    let out = new Float32Array(3);
    out[0] = (a.length > 0) ? a[0] : 0;
    out[1] = (a.length > 1) ? a[1] : 0;
    return out;
};

/**
 * Creates a new vec3 initialized from the given vec
 *
 * @param {vec2 or vec3 or vec4} a
 * @returns {vec3} a new 4D vector
 */
vec3.fromVec = function(a) {
    let out = new Float32Array(3);
    out[0] = (a.length > 0) ? a[0] : 0;
    out[1] = (a.length > 1) ? a[1] : 0;
    out[2] = (a.length > 2) ? a[2] : 0;
    return out;
};

/**
 * Creates a new vec4 initialized from the given vec
 *
 * @param {vec2 or vec3 or vec4} a
 * @returns {vec4} a new 4D vector
 */
vec4.fromVec = function(a) {
    let out = new Float32Array(4);
    out[0] = (a.length > 0) ? a[0] : 0;
    out[1] = (a.length > 1) ? a[1] : 0;
    out[2] = (a.length > 2) ? a[2] : 0;
    out[3] = (a.length > 3) ? a[3] : 0;
    return out;
};


/**
 * Cette méthode calcule le vec2 interpolé par une spline cubique de Hermite entre (p0,t0), (p1,t1)
 * @param out : résultat
 * @param p0 : coordonnées à k=0
 * @param t0 : tangente à k=0
 * @param p1 : coordonnées à k=1
 * @param t1 : tangente à k=1
 * @param k : coefficient d'interpolation
 */
vec2.hermite = function(out, p0, t0, p1, t1, k)
{
    let h00 = ((2*k) - 3)*k*k + 1;
    let h10 = ((k - 2)*k + 1)*k;
    let h01 = (3 - 2*k)*k*k;
    let h11 = (k - 1)*k*k;

    vec3.set(out, 0.0, 0.0, 0.0);
    vec2.scaleAndAdd(out, out, p0, h00);
    vec2.scaleAndAdd(out, out, t0, h10);
    vec2.scaleAndAdd(out, out, p1, h01);
    vec2.scaleAndAdd(out, out, t1, h11);
}


/**
 * Cette méthode calcule le vec3 interpolé par une spline cubique de Hermite entre (p0,t0), (p1,t1)
 * @param out : résultat
 * @param p0 : coordonnées à k=0
 * @param t0 : tangente à k=0
 * @param p1 : coordonnées à k=1
 * @param t1 : tangente à k=1
 * @param k : coefficient d'interpolation
 */
vec3.hermite = function(out, p0, t0, p1, t1, k)
{
    let h00 = ((2*k) - 3)*k*k + 1;
    let h10 = ((k - 2)*k + 1)*k;
    let h01 = (3 - 2*k)*k*k;
    let h11 = (k - 1)*k*k;

    vec3.set(out, 0.0, 0.0, 0.0);
    vec3.scaleAndAdd(out, out, p0, h00);
    vec3.scaleAndAdd(out, out, t0, h10);
    vec3.scaleAndAdd(out, out, p1, h01);
    vec3.scaleAndAdd(out, out, t1, h11);
}


/**
 * Cette méthode calcule le vec4 interpolé par une spline cubique de Hermite entre (p0,t0), (p1,t1)
 * @param out : résultat
 * @param p0 : coordonnées à k=0
 * @param t0 : tangente à k=0
 * @param p1 : coordonnées à k=1
 * @param t1 : tangente à k=1
 * @param k : coefficient d'interpolation
 */
vec4.hermite = function(out, p0, t0, p1, t1, k)
{
    let h00 = ((2*k) - 3)*k*k + 1;
    let h10 = ((k - 2)*k + 1)*k;
    let h01 = (3 - 2*k)*k*k;
    let h11 = (k - 1)*k*k;

    vec4.set(out, 0.0, 0.0, 0.0, 0.0);
    vec4.scaleAndAdd(out, out, p0, h00);
    vec4.scaleAndAdd(out, out, t0, h10);
    vec4.scaleAndAdd(out, out, p1, h01);
    vec4.scaleAndAdd(out, out, t1, h11);
}




/**
 * Cette fonction supprime l'élément indiqué de la liste
 * @param vect : liste contenant éventuellement elem
 * @param item : élément à enlever du résultat en retour
 */
function list_remove(vect, item)
{
    let index = vect.indexOf(item);
    if (index >= 0) {
        vect.splice(index, 1);
    }
}


/**
 * Cette fonction crée une copie de la liste fournie (clonage superficiel)
 * @param vect : liste à copier, ses éléments sont partagés
 * @return copie de la liste (éléments partagés)
 */
function list_clone(vect)
{
    let clone = [];
    let nb = vect.length;
    for (let i=0; i<nb; i++) {
        clone.push(vect[i]);
    }
    return clone;
}



/**
 * Cette fonction calcule l'union des deux ensembles
 * @param set1 : liste
 * @param set2 : liste
 * @return union des deux listes
 */
function set_union(set1, set2)
{
    let result = [];
    // rajouter tous les éléments de l'set1
    let nb1 = set1.length;
    for (let i=0; i<nb1; i++) {
        let item = set1[i];
        let index = result.indexOf(item);
        if (index < 0) {
            result.push(item);
        }
    }
    // rajouter tous les éléments de l'set2
    let nb2 = set2.length;
    for (let i=0; i<nb2; i++) {
        let item = set2[i];
        let index = result.indexOf(item);
        if (index < 0) {
            result.push(item);
        }
    }
    return result;
}


/**
 * Cette fonction vérifie que la classe est définie, qu'elle a bien été incluse dans le HTML
 * @param required_class : chaîne contenant le nom de la classe ou le fichier .js à inclure
 */
function Requires(required_class)
{
    // extraire le nom de la classe : enlever chemin et extension s'il y en a
    let classname = required_class.split("/").pop();
    classname = classname.split(".")[0];

    // cette classe a-t-elle été définie ?
    let ok = true;
    try {
        eval(classname);
    } catch (e) {
        ok = false;
        }
    if (!ok || typeof eval(classname) !== 'function' || eval(classname).hasOwnProperty('arguments')) {

        // récupérer le nom du source JS actuel, il donne le nom de la classe demandeuse
        let scripts = document.getElementsByTagName("script");
        let src = scripts[scripts.length-1].src;
        let caller = src.split("/").pop();

        // page html qui contient le tout
        let page = window.location.href.split("/").slice(-5).join("/");

        // message
        let message = "In "+page+", file "+required_class+" is not included before "+caller+" or is incorrect";
        throw message;
    }
}


/**
 * Cette fonction est tirée de https://gist.github.com/zenparsing, dedent-template.js
 * Elle permet d'ajuster l'indentation d'une chaîne multiligne à celle de la première.
 * On fait ainsi :
 *      let chaine = dedent
 *          `texte qui ne sera pas indenté
 *               ce texte sera indenté mais de 4 espaces
 *           ce texte ne sera pas indenté`
 * @param callSite
 * @param ...args
 */
function dedent(callSite, ...args) {

    function format(str) {

        let size = -1;

        return str.replace(/\n(\s+)/g, (m, m1) => {

            if (size < 0)
                size = m1.replace(/\t/g, "    ").length;

            return "\n" + m1.slice(Math.min(m1.length, size));
        });
    }

    if (typeof callSite === "string")
        return format(callSite);

    if (typeof callSite === "function")
        return (...args) => format(callSite(...args));

    let output = callSite
        .slice(0, args.length + 1)
        .map((text, i) => (i === 0 ? "" : args[i - 1]) + text)
        .join("");

    return format(output);
}
