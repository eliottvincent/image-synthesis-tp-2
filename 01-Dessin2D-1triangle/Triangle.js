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
            void main()
            {
                gl_Position = vec4(glVertex, 0.0, 1.0);
            }`;

        let srcFragmentShaderV2 = dedent
            `#version 300 es
            precision mediump float;
            out vec4 glFragColor;
            void main()
            {
                glFragColor = vec4(0.84, 0.15, 0.51, 1.0);
            }`;

        // compiler le shader de dessin
        this.m_ShaderId = Utils.makeShaderProgram(srcVertexShaderV2, srcFragmentShaderV2, "Triangle");
        console.debug("Source du vertex shader :\n"+srcVertexShaderV2);
        console.debug("Source du fragment shader :\n"+srcFragmentShaderV2);


        // déterminer où sont les variables attribute
        this.m_VertexLoc = gl.getAttribLocation(this.m_ShaderId, "glVertex");


        /** VBOs */

            // créer et remplir le buffer des coordonnées
        let vertices = [
                -0.88, +0.52,       // P0
                +0.63, -0.79,       // P1
                +0.14, +0.95,       // P2
            ];
        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
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

        // dessiner un triangle avec les trois vertices
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // désactiver le buffer
        gl.disableVertexAttribArray(this.m_VertexLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // désactiver le shader
        gl.useProgram(null);
    }


    /** destructeur */
    destroy()
    {
        // supprimer le shader et le VBO
        Utils.deleteShaderProgram(this.m_ShaderId);
        Utils.deleteVBO(this.m_VertexBufferId);
    }
}
