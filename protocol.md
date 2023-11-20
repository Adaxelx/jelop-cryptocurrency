# Protokół Komunikacyjny Blockchain

## Opis

Protokół komunikacyjny używany w systemie blockchain służy do wymiany informacji
między węzłami w sieci. Poniżej przedstawiono główne rodzaje połączeń
obsługiwanych przez `messageHandler`.

## Połączenia

1. **Request Sign (Żądanie Podpisu)**

   - **Opis:** Obsługuje żądania podpisu transakcji.
   - **Przykład użycia:**
     ```json
     {
       "type": "requestSign",
       "payload": {
         "transactionData": {
           "sender": "0xabcdef",
           "recipient": "0x123456",
           "amount": 10
         }
       }
     }
     ```

2. **Response Sign (Odpowiedź na Podpis)**

   - **Opis:** Obsługuje odpowiedzi na żądania podpisu transakcji.
   - **Przykład użycia:**
     ```json
     {
       "type": "responseSign",
       "payload": {
         "isValid": true
       }
     }
     ```

3. **Connect (Połączenie)**

   - **Opis:** Umożliwia węzłowi dołączanie do sieci poprzez nawiązywanie
     połączenia z innymi węzłami.
   - **Przykład użycia:**
     ```json
     {
       "type": "connect",
       "payload": {
         "port": 12345,
         "publicKey": "0xabcdef"
       }
     }
     ```

4. **Add Block (Dodanie Bloku)**
   - **Opis:** Informuje inne węzły o dodaniu nowego bloku do blockchain.
   - **Przykład użycia:**
     ```json
     {
       "type": "addBlock",
       "payload": {
         "timestamp": 1634567890,
         "data": {
           "transactions": [
             {
               "sender": "0xabcdef",
               "recipient": "0x123456",
               "amount": 10
             },
             {
               "sender": "0x123456",
               "recipient": "0xabcdef",
               "amount": 5
             }
           ]
         },
         "hash": "0xabcdef123456",
         "prevHash": "0x123456abcdef",
         "nonce": 0
       }
     }
     ```
