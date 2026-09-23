// EN: entry point of the example app — reads a name from the CLI arguments
// PL: punkt wejścia przykładowej aplikacji — czyta imię z argumentów CLI

importuj { dodaj, pomnóż } z './kalkulator.pls';

funkcja główna(): pustka {
	// EN: process.argv[0] is node, [1] is the script — user args start at [2]
	// PL: process.argv[0] to node, [1] to skrypt — argumenty użytkownika od [2]
	stała argumenty = proces.argv.wycinek(2);
	stała imię = argumenty[0] ?? 'Świecie';

	konsola.dziennik(`Witaj, ${imię}! / Hello, ${imię}!`);
	konsola.dziennik('2 + 3 =', dodaj(2, 3));
	konsola.dziennik('4 × 5 =', pomnóż(4, 5));
}

główna();
