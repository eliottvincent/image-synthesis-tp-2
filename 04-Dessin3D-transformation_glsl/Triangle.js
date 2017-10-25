// Définition de la classe Triangle


class Triangle
{
    /** constructeur */
    constructor()
    {
        /** shader */

        // version WebGL2

        let srcVertexShaderV2 = dedent
            `#version 300 es
            uniform float time;
            in vec2 glVertex;
            in vec3 glColor;
            out vec3 frgColor;
            void main()
            {
                // angle en radians
                float angle = time * 2.0;

                // construction de la matrice de rotation
                float cosa = cos(angle);
                float sina = sin(angle);
                mat2 rotation = mat2(sina, cosa, -cosa, sina);
                
                // application de la rotation
                gl_Position = vec4(rotation * vec2(0.2, 0.0) + glVertex, 0.0, 1.0);
                frgColor = glColor * (sina * 0.5 + 0.5);
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

        // déterminer où sont les variables attribute et uniform
        this.m_VertexLoc = gl.getAttribLocation(this.m_ShaderId, "glVertex");
        this.m_ColorLoc = gl.getAttribLocation(this.m_ShaderId, "glColor");
        this.m_TimeLoc = gl.getUniformLocation(this.m_ShaderId, "time");

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
    }


    /** dessiner l'objet */
    onDraw()
    {
        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir la variable Utils.Time au shader
        gl.uniform1f(this.m_TimeLoc, Utils.Time);

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
