// Définition de la classe Pyramide


class Pyramide
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
            in vec3 glColor;
            out vec3 frgColor;
            void main()
            {
                gl_Position = matrix * vec4(glVertex, 1.0);
                frgColor = glColor;
            }`;

        let srcFragmentShaderV2 = dedent
            `#version 300 es
            precision mediump float;
            const vec3 fogColor = vec3(0.9, 0.9, 0.9);
            in vec3 frgColor;
            out vec4 glFragColor;
            void main()
            {
                // distance entre l'écran et le fragment
                float dist = gl_FragCoord.z / gl_FragCoord.w;
                //glFragColor = vec4(dist - 9.0, 9.0 - dist, 0, 1);
                // taux de brouillard en fonction de la distance
                float fog = clamp((dist-10.0)/10.0, 0.0, 1.0);
                //glFragColor = vec4(fog, fog, fog, 1);return;
                // mélange couleur et brouillard
                glFragColor = vec4(mix(frgColor, fogColor, fog), 1.0);return;

                // pour la mise au point de la perspective (near et far)
                glFragColor = vec4(frgColor, 1.0);
            }`;

        // compiler le shader de dessin
        this.m_ShaderId = Utils.makeShaderProgram(srcVertexShaderV2, srcFragmentShaderV2, "Triangle");
        console.debug("Source du vertex shader :\n"+srcVertexShaderV2);
        console.debug("Source du fragment shader :\n"+srcFragmentShaderV2);

        // déterminer où sont les variables attribute et uniform
        this.m_MatrixLoc = gl.getUniformLocation(this.m_ShaderId, "matrix");
        this.m_VertexLoc = gl.getAttribLocation(this.m_ShaderId, "glVertex");
        this.m_ColorLoc = gl.getAttribLocation(this.m_ShaderId, "glColor");


        /** VBOs */
            // créer et remplir le buffer des coordonnées
        const b = 0.5;
        let vertices = [
            +2*b, 0, +2*b,     // P0 bleu
            +2*b, 0, -2*b,     // P1 orange
            -2*b, 0, -2*b,     // P2 vert
            -2*b, 0, +2*b,     // P3 violet
            0, +4*b, 0,     // P4 violet
        ];
        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

        // créer et remplir le buffer des couleurs
        let colors = [
            0.0, 0.5, 1.0,  // P0 bleu
            1.0, 0.5, 0.0,  // P1 orange
            0.0, 1.0, 0.0,  // P2 vert
            0.7, 0.0, 0.7,  // P3 violet
            0.7, 0.0, 0.7,  // P4 jaune
        ];
        this.m_ColorBufferId = Utils.makeFloatVBO(colors, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

        // créer et remplir le buffer des indices
        // attention, l'ordre est inversé car il n'y a pas de projection perspective, donc
        // on est en repère main gauche
        let indexlist = [
            0, 1, 4,
            1, 2, 4,
            2, 3, 4,
            3, 0, 4,
            2, 1, 0,
            2, 0, 3
        ];
        this.TRIANGLE_COUNT = indexlist.length / 3;
        this.m_IndexBufferId = Utils.makeShortVBO(indexlist, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);

        // matrices de transformation intermédiaires (on pourrait économiser l'une d'elles)
        this.m_MatVM = mat4.create();       // V * M
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
        mat4.mul(this.m_MatVM, matP, matV);
        mat4.glUniformMatrix(this.m_MatrixLoc, this.m_MatVM);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // activer et lier le buffer contenant les couleurs
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_ColorBufferId);
        gl.enableVertexAttribArray(this.m_ColorLoc);
        gl.vertexAttribPointer(this.m_ColorLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // activer et lier le buffer contenant les indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.m_IndexBufferId);

        // dessiner les triangles
        gl.drawElements(gl.TRIANGLES, this.TRIANGLE_COUNT * 3, gl.UNSIGNED_SHORT, 0);

        // désactiver les buffers
        gl.disableVertexAttribArray(this.m_VertexLoc);
        gl.disableVertexAttribArray(this.m_ColorLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

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
        Utils.deleteVBO(this.m_IndexBufferId);
    }
}
