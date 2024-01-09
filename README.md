# Jelop crypto

## Jak odpalać

```
P2P_PORT=300X npm run dev
```

## Orientacyjny harmonogram

### Sieć peer-to-peer (10p) - 3 tyg. (termin oddania: 25.10.2023),

- Tworzenie tożsamości cyfrowej
- Przechowywanie kluczy w cyfrowym portfelu
- Uruchomienie i rejestracja węzła
- Weryfikacja tożsamości węzła

### Prosty łańcuch bloków (10p) - 3 tyg. (termin oddania: 22.11.2023),

- Tworzenie bloków
- Walidacja integralności
- Ustalenie protokołu wymiany danych
- Synchronizacja węzłów
- Osiągnięcie konsensusu (metoda proof-of-work)

### Transakcje przekazania środków (10p) - 3 tyg. (termin oddania: 13.12.2023),

- Tworzenie transakcji w formacie json (lista w bloku)
- Walidacja transakcji pod kątem double-spending
- Obliczanie aktualnych sald na kontach

### Kopanie asynchroniczne (10p) - 3 tyg (termin oddania:10.01.2024).

- Obsługa forków oraz orphan block
- Tworzenie forków przez złośliwego node

## Sprawozdanie końcowe (10p)

Sprawozdanie końcowe z projektu w formie pliku PDF powinno zostać umieszczone do
17.01.2024 w systemie ISOD. Powinno zawierać następujące elementy:

- ogólna architektura i funkcjonalność systemu,
- przedstawienie algorytmów kryptograficznych zastosowanych w projekcie
  (długości kluczy, implementacje, itp.) oraz uzasadnienia dla takiego wyboru,
- wyniki analiz bezpieczeństwa i symulacji jego zachowania podczas różnych
  zaburzeń (ataków);
- przykładowe scenariusze:
- nieuczciwy węzeł,
- grupa węzłów działająca w zmowie,
- awaria łącza danych,
- ogromna dysproporcja pomiędzy zasobami węzłów,
- skuteczny atak na jeden algorytm kryptograficzny,
- awaria danych w jednym z węzłów,
- zgubienie hasła do klucza prywatnego
