// EN: classic "hello world" with a main class, written entirely in Polish
// PL: klasyczne „witaj świecie” z klasą główną, napisane w całości po polsku

klasa Program {
	// EN: the message this program prints
	// PL: wiadomość, którą wypisuje ten program
	prywatna wiadomość: napis;

	konstruktor(wiadomość: napis) {
		to.wiadomość = wiadomość;
	}

	// EN: instance method — does the actual work
	// PL: metoda instancji — wykonuje właściwą pracę
	publiczna uruchom(): pustka {
		konsola.dziennik(to.wiadomość);
	}

	// EN: static entry point, like `public static void main`
	// PL: statyczny punkt wejścia, jak `public static void main`
	publiczna statyczna główna(): pustka {
		stała program = nowy Program('Witaj, świecie! / Hello, world!');
		program.uruchom();
	}
}

// EN: run the program
// PL: uruchom program
Program.główna();
