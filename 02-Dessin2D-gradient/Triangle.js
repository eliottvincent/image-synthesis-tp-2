﻿// Définition de la classe Triangle


class Triangle
{
    /** constructeur */
    constructor()
    {
        /** shader */

        // version WebGL2
        let srcVertexShaderV2 = dedent
            `#version 300 es
            in vec2 glVertex;
            in vec3 glColor;
            out vec3 frgColor;
            void main()
            {
                gl_Position = vec4(glVertex, 0.0, 1.0);
                frgColor = glColor;
            }`;

        let srcFragmentShaderV2 = dedent
            `#version 300 es
            precision mediump float;
            in vec3 frgColor;
            out vec4 glFragColor;
            void main()
            {
                glFragColor = vec4(frgColor, 1.0);
            }`;

        // compiler le shader de dessin
            this.m_ShaderId = Utils.makeShaderProgram(srcVertexShaderV2, srcFragmentShaderV2, "Triangle");
            console.debug("Source du vertex shader :\n"+srcVertexShaderV2);
            console.debug("Source du fragment shader :\n"+srcFragmentShaderV2);


        // déterminer où sont les variables attribute
        this.m_VertexLoc = gl.getAttribLocation(this.m_ShaderId, "glVertex");
        this.m_ColorLoc = gl.getAttribLocation(this.m_ShaderId, "glColor");

        /** VBOs */

        // créer et remplir le buffer des coordonnées
        let vertices = [
            -0.88, +0.52,       // P0
            +0.63, -0.79,       // P1
            +0.14, +0.95,       // P2
        ];
        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

        // créer et remplir le buffer des couleurs
        let colors = [
            1.0, 0.0, 0.5,      // P0
            0.0, 0.0, 1.0,      // P1
            1.0, 1.0, 0.0,      // P2
        ];
        this.m_ColorBufferId = Utils.makeFloatVBO(colors, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

        // créer et remplir le buffer des couleurs
        let lineColors = [
            1.0, 1.0, 1.0,      // P0
            1.0, 1.0, 1.0,      // P1
            1.0, 1.0, 1.0,      // P2
        ];
        this.m_ColorLinesBufferId = Utils.makeFloatVBO(lineColors, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    }


    /** dessiner l'objet */
    onDraw()
    {
        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC2, gl.FLOAT, gl.FALSE, 0, 0);

        // activer et lier le buffer contenant les couleurs
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_ColorBufferId);
        gl.enableVertexAttribArray(this.m_ColorLoc);
        gl.vertexAttribPointer(this.m_ColorLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // dessiner un triangle avec les trois vertices
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_ColorBufferId);

        // changement de shader
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_ColorLinesBufferId);
        gl.enableVertexAttribArray(this.m_ColorLoc);
        gl.vertexAttribPointer(this.m_ColorLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.drawArrays(gl.LINE_LOOP, 0, 3);   // uniquement le contour

        // désactiver les buffers
        gl.disableVertexAttribArray(this.m_VertexLoc);
        gl.disableVertexAttribArray(this.m_ColorLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // désactiver le shader
        gl.useProgram(null);
    }


    /** destructeur */
    destroy()
    {
        // supprimer le shader et les VBOs
        Utils.deleteShaderProgram(this.m_ShaderId);
        Utils.deleteVBO(this.m_VertexBufferId);
        Utils.deleteVBO(this.m_ColorBufferId);
    }
}
