// EN: main example program written entirely in Polish
// PL: główny przykładowy program napisany w całości po polsku

importuj { pozdrów, BezWieku } z './pomocnik.pls';

interfejs Osoba {
	imię: napis;
	wiek: liczba;
}

wyliczenie Rola {
	Admin = 'admin',
	Zwykły = 'zwykły',
}

klasa Pracownik {
	publiczna imię: napis;
	prywatna wiek: liczba;

	konstruktor(imię: napis, wiek: liczba) {
		to.imię = imię;
		to.wiek = wiek;
	}

	// EN: returns a short description
	// PL: zwraca krótki opis
	publiczna opis(): napis {
		zwróć `${to.imię} ma ${to.wiek} lat`;
	}
}

// EN: classic recursive Fibonacci
// PL: klasyczne rekurencyjne Fibonacciego
funkcja fib(n: liczba): liczba {
	jeżeli(n < 2) {
		zwróć n;
	}

	zwróć fib(n - 1) + fib(n - 2);
}

asynchroniczna funkcja główna(): Obietnica<pustka> {
	konsola.dziennik(pozdrów('Świecie'));

	stała liczby = [1, 2, 3, 4, 5, 6];
	stała parzyste = liczby.filtruj((x) => x % 2 === 0);
	konsola.dziennik('Parzyste / Even:', parzyste);

	stała suma = liczby.zredukuj((a, b) => a + b, 0);
	konsola.dziennik('Suma / Sum:', suma);

	dla(niech i = 0; i < 6; i++) {
		konsola.dziennik(`fib(${i}) =`, fib(i));
	}

	stała pracownik = nowy Pracownik('Ania', 30);
	konsola.dziennik(pracownik.opis());

	// EN: an anonymised person via the utility type
	// PL: zanonimizowana osoba przez typ narzędziowy
	stała ktoś: BezWieku<Osoba> = { imię: 'Nieznany' };
	konsola.dziennik('Bez wieku / Without age:', ktoś);

	stała wynik = czekaj nowy Obietnica<napis>((rozwiąż) => {
		ustawLimitCzasu(() => rozwiąż('gotowe / done'), 10);
	});
	konsola.dziennik('Obietnica / Promise:', wynik);

	stała rola: Rola = Rola.Admin;

	jeżeli(rola === Rola.Admin) {
		konsola.dziennik('Jesteś adminem / You are admin');
	}
	inaczej {
		konsola.dziennik('Zwykły użytkownik / Regular user');
	}
}

główna().złap((błąd) => konsola.błąd(błąd));
