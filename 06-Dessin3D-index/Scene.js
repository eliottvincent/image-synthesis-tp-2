// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Tetraedre");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_Tetraedre = new Tetraedre();

        // couleur du fond : gris foncé
        gl.clearColor(0.4, 0.4, 0.4, 0.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // activer la suppression des faces cachées
        gl.enable(gl.CULL_FACE);
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
     * Dessine l'image courante
     */
    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // créer une matrice de rotation
        mat4.identity(this.m_Matrix);
        mat4.rotate(this.m_Matrix, this.m_Matrix, Utils.radians(25.0 * Utils.Time), vec3.fromValues(1,2,0));

        // dessiner le tétraèdre
        this.m_Tetraedre.onDraw(this.m_Matrix);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_Tetraedre.destroy();
    }
}
