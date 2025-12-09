package org.example.be.controller;

import lombok.RequiredArgsConstructor;
import org.example.be.entity.Card;
import org.example.be.entity.User;
import org.example.be.repository.UserRepository;
import org.example.be.service.CardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CardController {

    private final CardService cardService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

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
    public ResponseEntity<Card> createCard(@RequestBody Card card, Authentication auth) {
        Long userId = getCurrentUserId(auth);

        Card savedCard = cardService.createCardInList(card, card.getList().getId(), userId);
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
    public ResponseEntity<Void> deleteCard(@PathVariable Long id, Authentication auth) {

        Long userId = getCurrentUserId(auth);

        cardService.deleteCard(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{cardId}/move")
    public ResponseEntity<Card> moveCard(@PathVariable Long cardId, @RequestBody Map<String, Object> payload, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        Long newListId = Long.valueOf(payload.get("newListId").toString());
        Integer newPosition = (Integer) payload.get("newPosition");
        Card movedCard = cardService.moveCard(cardId, newListId, newPosition, userId);
        return ResponseEntity.ok(movedCard);
    }

    @PostMapping("/{cardId}/members/{memberId}")
    public ResponseEntity<Card> assignMember(@PathVariable Long cardId, @PathVariable Long memberId, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        Card updatedCard = cardService.assignMember(cardId, memberId, userId);
        return ResponseEntity.ok(updatedCard);
    }

    @DeleteMapping("/{cardId}/members/{memberId}")
    public ResponseEntity<Card> unassignMember(@PathVariable Long cardId, @PathVariable Long memberId, Authentication auth) {
        Long userId = getCurrentUserId(auth);

        Card updatedCard = cardService.unassignMember(cardId, memberId, userId);
        return ResponseEntity.ok(updatedCard);
    }

    @PostMapping("/{cardId}/labels/{labelId}")
    public ResponseEntity<Card> assignLabel(@PathVariable Long cardId, @PathVariable Long labelId, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        Card updatedCard = cardService.assignLabel(cardId, labelId, userId);
        return ResponseEntity.ok(updatedCard);
    }

    @DeleteMapping("/{cardId}/labels/{labelId}")
    public ResponseEntity<Card> unassignLabel(@PathVariable Long cardId, @PathVariable Long labelId, Authentication auth) {
        Long userId = getCurrentUserId(auth);

        Card updatedCard = cardService.unassignLabel(cardId, labelId, userId);
        return ResponseEntity.ok(updatedCard);
    }
}