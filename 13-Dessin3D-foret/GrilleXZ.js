// Définition de la classe GrilleXZ


class GrilleXZ
{
    /**
     *
     * @param nombre: nombre de lignes x et z vont de - nombre à + nombre
     */
    constructor(nombre = 5)
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
                glFragColor = vec4(0.7, 0.7, 0.7, 1.0);return;
            }`;

        // compiler le shader de dessin
        this.m_ShaderId = Utils.makeShaderProgram(srcVertexShaderV2, srcFragmentShaderV2, "Grille");
        console.debug("Source du vertex shader :\n"+srcVertexShaderV2);
        console.debug("Source du fragment shader :\n"+srcFragmentShaderV2);

        // déterminer où sont les variables attribute et uniform
        this.m_MatrixLoc = gl.getUniformLocation(this.m_ShaderId, "matrix");
        this.m_VertexLoc = gl.getAttribLocation(this.m_ShaderId, "glVertex");

        /** VBOs */
        // créer et remplir le buffer des coordonnées
        let vertices = [];
        const b = 0.5;
        for (let i = -nombre; i <= +nombre; i+= b) {
            // point de depart
            vertices.push(i);
            vertices.push(0.0);
            vertices.push(-nombre);

            // point d'arrivée
            vertices.push(i);
            vertices.push(0.0);
            vertices.push(+nombre);

            // point de depart
            vertices.push(-nombre);
            vertices.push(0.0);
            vertices.push(i);

            // point d'arrivée
            vertices.push(+nombre);
            vertices.push(0.0);
            vertices.push(i);
        }
        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        this.LINE_COUNT = vertices.length / 3;

        // matrices de transformation intermédiaires (on pourrait économiser l'une d'elles)
        this.m_MatPV = mat4.create();      // P * V * M
    }


    /**
     * dessiner l'objet
     * @param matP : matrice de projection perpective
     * @param matV : matrice de transformation de l'objet par rapport à la caméra
     */
    onDraw(matP, matV)
    {
        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir la matrice P * V * M au shader
        mat4.mul(this.m_MatPV, matP, matV);
        mat4.glUniformMatrix(this.m_MatrixLoc, this.m_MatPV);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // dessiner les lignes
        gl.drawArrays(gl.LINES, 0, this.LINE_COUNT);

        // désactiver les buffers
        gl.disableVertexAttribArray(this.m_VertexLoc);
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
    }
}
