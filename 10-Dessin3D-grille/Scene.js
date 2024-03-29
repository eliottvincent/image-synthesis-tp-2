// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("GrilleXZ");

class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_GrilleXZ = new GrilleXZ();

        // couleur du fond : gris foncé
        gl.clearColor(0.9, 0.9, 0.9, 1.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // activer la suppression des faces cachées
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // créer les matrices utilisées
        this.m_MatView = mat4.create();
        this.m_MatProjection = mat4.create();
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

        // matrice de projection
        mat4.perspective(this.m_MatProjection, Utils.radians(15.0), width / height, 0.1, 25.0);
    }


    /**
     * Dessine l'image courante
     */
    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // positionner la caméra en (0,0,15), c'est à dire la scène est décalée en z=-9
        mat4.identity(this.m_MatView);
        mat4.translate(this.m_MatView, this.m_MatView, vec3.fromValues(0, 0, -15));
        mat4.rotateX(this.m_MatView, this.m_MatView, Utils.radians(20.0));
        mat4.rotateY(this.m_MatView, this.m_MatView, Utils.radians(30.0));

        // dessiner le GrilleXZ
        this.m_GrilleXZ.onDraw(this.m_MatProjection, this.m_MatView);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_GrilleXZ.destroy();
    }
}
