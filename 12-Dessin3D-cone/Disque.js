// Définition de la classe Disque


class Disque
{
    /**
     *
     * @param nombre : nombre de triangles dans le disque
     */
    constructor(nombre = 100)
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
        let vertices = [
            0.0, 0.0, 0.0   // pivot pour le DISQUE
        ];

        /*let vertices = [
            0.0, 2.0, 0.0   // pivot pour le CÔNE
        ];*/
        for (let i = 0; i <= nombre; i++) {
            vertices.push(Math.cos((2 * Math.PI * i) / nombre));
            vertices.push(0.0);
            vertices.push(Math.sin((2 * Math.PI * i) / nombre));
        }
        this.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

        // créer et remplir le buffer des couleurs
        let colors = [
            0.0, 0.5, 1.0   // PIVOT bleu
        ];
        for (let i = 0; i <= nombre; i++) {
            let hsv = vec3.fromValues((i*1.0)/nombre, 1.0, 1.0);
            let rgb = Utils.hsv2rgb(hsv);
            colors.push(rgb[0]);
            colors.push(rgb[1]);
            colors.push(rgb[2]);
        }
        this.m_ColorBufferId = Utils.makeFloatVBO(colors, gl.ARRAY_BUFFER, gl.STATIC_DRAW);

        this.VERTEX_COUNT = vertices.length / 3;

        // matrices de transformation intermédiaires (on pourrait économiser l'une d'elles)
        this.m_MatVM = mat4.create();       // V * M
        this.m_MatPVM = mat4.create();      // P * V * M
    }


    /**
     * dessiner l'objet
     * @param matP : matrice de projection perpective
     * @param matV : matrice de transformation de l'objet par rapport à la caméra
     */
    onDraw(matP, matV)
    {
        // rajouter une translation pour décaler l'objet d'arrière en avant
        mat4.translate(this.m_MatVM, matV, vec3.fromValues(0, 0, 3.0*Math.sin(Utils.Time*0.5)));

        // rajouter des rotations pour faire basculer l'objet dans tous les sens
        mat4.rotate(this.m_MatVM, this.m_MatVM, Utils.radians(45.0 * Utils.Time), vec3.fromValues(0,1,0));
        mat4.rotate(this.m_MatVM, this.m_MatVM, Utils.radians(67.0 * Utils.Time), vec3.fromValues(0.75,0,0.5));

        // activer le shader
        gl.useProgram(this.m_ShaderId);

        // fournir la matrice P * V * M au shader
        mat4.mul(this.m_MatPVM, matP, this.m_MatVM);
        mat4.glUniformMatrix(this.m_MatrixLoc, this.m_MatPVM);

        // activer et lier le buffer contenant les coordonnées
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_VertexBufferId);
        gl.enableVertexAttribArray(this.m_VertexLoc);
        gl.vertexAttribPointer(this.m_VertexLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // activer et lier le buffer contenant les couleurs
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_ColorBufferId);
        gl.enableVertexAttribArray(this.m_ColorLoc);
        gl.vertexAttribPointer(this.m_ColorLoc, Utils.VEC3, gl.FLOAT, gl.FALSE, 0, 0);

        // dessiner les triangles
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.VERTEX_COUNT);

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
