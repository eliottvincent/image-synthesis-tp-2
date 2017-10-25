// Définition de la classe Counter
// cette classe est un compteur


class Counter
{
    /** constructeur */
    constructor(initval=0)
    {
        this.m_Value = initval;
        console.debug("initialisation à "+initval);
    }


    /** getter */
    getCount()
    {
        return this.m_Value;
    }


    /** incrémentation */
    increment()
    {
        this.m_Value++;
        console.debug("incrementation");
    }
}
