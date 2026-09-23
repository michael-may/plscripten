// EN: helper module — exported from the main program
// PL: moduł pomocniczy — importowany przez program główny

eksportuj funkcja pozdrów(kogo: napis): napis {
	zwróć `Cześć, ${kogo}! (Hello!)`;
}

// EN: A tiny utility type demo so the type layer gets exercised too.
// PL: Mały pokaz typu narzędziowego, aby warstwa typów też była użyta.
eksportuj typ BezWieku<T> = Pomiń<T, 'wiek'>;
