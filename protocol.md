# Protokół Komunikacyjny Blockchain

## Opis

Protokół komunikacyjny JELOP COIN

## Możliwe komunikaty

1. **requestSign (Żądanie Podpisu)**

   - **Opis:** Wywołuje rządanie weryfikacji tożsamości przez wskazany węzeł
   - **Przykład użycia:**
     ```json
     {
       "type": "requestSign",
       "payload": {
         "message": "example",
         "requestedFrom": "examplePublicKey"
       }
     }
     ```

2. **responseSign (Odpowiedź na Podpis)**

   - **Opis:** Obsługuje odpowiedź na zapytanie walidacyjne
   - **Przykład użycia:**
     ```json
     {
       "type": "responseSign",
       "payload": {
         "signature": "example signature",
         "responseFrom": "examplePublicKey"
       }
     }
     ```

3. **connect (Połączenie)**

   - **Opis:** Umożliwia węzłowi dołączanie do sieci poprzez nawiązywanie
     połączenia z innymi węzłami.
   - **Przykład użycia:**

     ```json
     {
       "type": "connect",
       "payload": {
         "port": "3000",
         "publicKey": "examplePublicKey",
         "withBlockchain": false
       }
     }
     ```

4. **sendBlockchain (Dodanie Bloku)**

- **Opis:** Wysyła blockchain użytkownika, do którego dany node się podłącza
- **Przykład użycia:**

  ```json
  {
    "type": "addBlock",
    "payload": {
      "chain": [
        {
          "timestamp": "1700594328711",
          "data": [
            {
              "from": "publicKey",
              "to": "publicKey2",
              "amount": 123
            }
          ],
          "hash": "07421a8f474c26e90257db7591d83f6118e892443b4f041f2ccedf962931f2a3",
          "prevHash": "",
          "nonce": 0
        }
      ],
      "difficulty": 10
    }
  }
  ```

5. **addBlock (Dodanie Bloku)**

   - **Opis:** Informuje inne węzły o dodaniu nowego bloku do blockchain.
   - **Przykład użycia:**

     ```json
     {
       "type": "addBlock",
       "payload": {
         "port": 3000,
         "publicKey": "123",
         "block": {
           "timestamp": "1700594817",
           "data": [
             {
               "from": "yy",
               "to": "xx",
               "amount": 3123
             }
           ],
           "hash": "123",
           "prevHash": "345",
           "nonce": 123
         }
       }
     }
     ```
