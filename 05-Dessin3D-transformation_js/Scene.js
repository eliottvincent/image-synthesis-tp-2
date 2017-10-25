// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("RedTriangle");
Requires("GreenTriangle");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_RedTriangle = new RedTriangle();
        this.m_GreenTriangle = new GreenTriangle();

        // couleur du fond : gris foncé
        gl.clearColor(0.4, 0.4, 0.4, 0.0);

        // activer le depth buffer
        //gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.DEPTH_TEST);

        // activer la suppression des faces cachées
        gl.disable(gl.CULL_FACE);
        //gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // créer une matrice pour l'animation
        this.m_Matrix = mat4.create();
    }


    /**
     * appelée quand la taille de la vue OpenGL change
     * @param width : largeur en nombre de pixels de la fenêtre
     * @param height : hauteur en nombre de pixels de la fenêtre
     */
    onSurfaceChanged(width, height)
    {
        // met en place le viewport
        gl.viewport(0, 0, width, height);
    }


    /**
     * Dessine l'image courante, Utils.Time indique le temps écoulé
     */
    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // créer une matrice de transformation
        mat4.identity(this.m_Matrix);
        let angle = Utils.radians(80.0 * Utils.Time);
        mat4.translate(this.m_Matrix, this.m_Matrix,vec3.fromValues(Math.cos(angle) * 0.1, Math.sin(angle) * 0.1, 0.0));

        mat4.rotateY(this.m_Matrix, this.m_Matrix, Utils.radians(25.0* Utils.Time));

        // dessiner les triangles
        this.m_RedTriangle.onDraw(this.m_Matrix);
        this.m_GreenTriangle.onDraw(this.m_Matrix);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_GreenTriangle.destroy();
        this.m_RedTriangle.destroy();
    }
}
