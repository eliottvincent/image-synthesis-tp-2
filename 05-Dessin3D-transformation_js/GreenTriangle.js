﻿// Définition de la classe GreenTriangle


class GreenTriangle
{
    /** constructeur */
    constructor()
    {
        /** shader */

            // version WebGL2

        let srcVertexShaderV2 = dedent
                `#version 300 es
            uniform mat4 matrix;
            in vec3 glVertex;
            void main()
            {
                gl_Position = matrix * vec4(glVertex, 1.0);
            }`;

        let srcFragmentShaderV2 = dedent
            `#version 300 es
            precision mediump float;
            out vec4 glFragColor;
            void main()
            {
                glFragColor = vec4(0.40, 0.75, 0.11, 1.0);
            }`;



        // compiler le shader de dessin
        this.m_ShaderId = Utils.makeShaderProgram(srcVertexShaderV2, srcFragmentShaderV2, "Triangle");
        console.debug("Source du vertex shader :\n"+srcVertexShaderV2);
        console.debug("Source du fragment shader :\n"+srcFragmentShaderV2);

        // déterminer où sont les variables attribute et uniform
        this.m_MatrixLoc = gl.getUniformLocation(this.m_ShaderId, "matrix");
        this.m_VertexLoc = gl.getAttribLocation(this.m_ShaderId, "glVertex");


        /** VBOs */

            // créer et remplir le buffer des coordonnées
        /*let vertices = [
                +0.86, +0.65, +0.5,
                -0.04, +0.57, -0.5,
                -0.40, -0.92, -0.5,
            ];*/
        let vertices = [
                +0.86, +0.65, 0.0,
                -0.04, +0.57, 0.0,
                -0.40, -0.92, 0.0,
            ];
        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    }


    /**
     * dessiner l'objet
     * @param matrix : matrice à appliquer sur l'objet
     */
    onDraw(matrix)
    {
        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir la matrice au shader
        mat4.glUniformMatrix(this.m_MatrixLoc, matrix);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // dessiner un triangle avec les trois vertices
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // dessiner le contour du triangle (on le voit toujours, même de dos)
        gl.drawArrays(gl.LINE_LOOP, 0, 3);

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
