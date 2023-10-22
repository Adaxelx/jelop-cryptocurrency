# Jelop crypto

## Jak odpalać

```
PEERS='[{"port":3000,"publicKey":"3052301006072a8648ce3d020106052b8104001a033e000400c5c0dedd80dea3462556520d7187209a27021bb5018b1482af69793fdc003d4391a226ebacefa93b419ca2e69f21f6c65564103fea89d2c0ebfc79"}]' P2P_PORT=3001 npm run dev
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
- Rozsyłanie transakcji oraz candidate block z prawdopodobieństwem

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
