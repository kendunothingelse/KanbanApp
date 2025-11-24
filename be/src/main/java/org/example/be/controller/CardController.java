package org.example.be.controller;

import lombok.RequiredArgsConstructor;
import org.example.be.entity.Card;
import org.example.be.service.CardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CardController {

    private final CardService cardService;

    @GetMapping
    public List<Card> getAllCards() {
        return cardService.findAllCards();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Card> getCardById(@PathVariable Long id) {
        return cardService.findCardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Card> createCard(@RequestBody Card card) {
        Card savedCard = cardService.createCardInList(card, card.getList().getId());
        return new ResponseEntity<>(savedCard, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Card> updateCard(@PathVariable Long id, @RequestBody Card cardDetails) {
        return cardService.findCardById(id)
                .map(card -> {
                    card.setTitle(cardDetails.getTitle());
                    card.setDescription(cardDetails.getDescription());
                    card.setDueDate(cardDetails.getDueDate());
                    return ResponseEntity.ok(cardService.saveCard(card));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        cardService.deleteCard(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{cardId}/move")
    public ResponseEntity<Card> moveCard(@PathVariable Long cardId, @RequestBody Map<String, Object> payload) {
        Long newListId = Long.valueOf(payload.get("newListId").toString());
        Integer newPosition = (Integer) payload.get("newPosition");
        Card movedCard = cardService.moveCard(cardId, newListId, newPosition);
        return ResponseEntity.ok(movedCard);
    }

    @PostMapping("/{cardId}/members/{memberId}")
    public ResponseEntity<Card> assignMember(@PathVariable Long cardId, @PathVariable Long memberId) {
        Card updatedCard = cardService.assignMember(cardId, memberId);
        return ResponseEntity.ok(updatedCard);
    }

    @DeleteMapping("/{cardId}/members/{memberId}")
    public ResponseEntity<Card> unassignMember(@PathVariable Long cardId, @PathVariable Long memberId) {
        Card updatedCard = cardService.unassignMember(cardId, memberId);
        return ResponseEntity.ok(updatedCard);
    }

    @PostMapping("/{cardId}/labels/{labelId}")
    public ResponseEntity<Card> assignLabel(@PathVariable Long cardId, @PathVariable Long labelId) {
        Card updatedCard = cardService.assignLabel(cardId, labelId);
        return ResponseEntity.ok(updatedCard);
    }

    @DeleteMapping("/{cardId}/labels/{labelId}")
    public ResponseEntity<Card> unassignLabel(@PathVariable Long cardId, @PathVariable Long labelId) {
        Card updatedCard = cardService.unassignLabel(cardId, labelId);
        return ResponseEntity.ok(updatedCard);
    }
}