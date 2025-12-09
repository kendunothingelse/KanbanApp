package org.example.be.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.be.entity.Card;
import org.example.be.entity.KBList;
import org.example.be.entity.Label;
import org.example.be.entity.Member;
import org.example.be.repository.CardRepository;
import org.example.be.repository.KBListRepository;
import org.example.be.repository.LabelRepository;
import org.example.be.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CardService {
    private final CardRepository cardRepository;
    private final KBListRepository kbListRepository;
    private final MemberRepository memberRepository;
    private final LabelRepository labelRepository;
    private final BoardService boardService;

    public List<Card> findAllCards() {
        return cardRepository.findAll();
    }

    public Optional<Card> findCardById(Long id) {
        return cardRepository.findById(id);
    }

    @Transactional
    public Card saveCard(Card card) {
        return cardRepository.save(card);
    }

    @Transactional
    public Card createCardInList(Card card, Long listId, Long userId) {
        KBList list = kbListRepository.findById(listId)
                .orElseThrow(() -> new EntityNotFoundException("List not found with id: " + listId));
        card.setList(list);
        //check if user is ADMIN
        Long boardId = list.getBoard().getId();
        boardService.requireAdmin(boardId, userId);
        card.setList(list);
        return cardRepository.save(card);
    }


    @Transactional
    public void deleteCard(Long id, Long userId) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Card not found with id: " + id));
        Long boardId = card.getList().getBoard().getId();
        boardService.requireAdmin(boardId, userId);

        cardRepository.deleteById(id);
    }

    @Transactional
    public Card moveCard(Long cardId, Long newListId, Integer newPosition, Long userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new EntityNotFoundException("Card not found"));

        //ADMIN CHECK
        Long boardId = card.getList().getBoard().getId();
        boardService.requireAdmin(boardId, userId);

        //create the new list object
        KBList newList = kbListRepository.findById(newListId)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));

        card.setList(newList);
        card.setCardOrder(newPosition);
        // Note: A full implementation would re-order other cards in the source and destination lists.
        // This is a simplified version for now.
        return cardRepository.save(card);
    }

    @Transactional
    public Card assignMember(Long cardId, Long memberId, Long userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new EntityNotFoundException("Card not found"));

        //ADMIN CHECK
        Long boardId = card.getList().getBoard().getId();
        boardService.requireAdmin(boardId, userId);

        //MEMBER FETCH
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        card.getMembers().add(member);
        return cardRepository.save(card);
    }

    @Transactional
    public Card unassignMember(Long cardId, Long memberId, Long userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new EntityNotFoundException("Card not found"));

        //ADDMIN CHECK
        Long boardId = card.getList().getBoard().getId();
        boardService.requireAdmin(boardId, userId);

        //MEMBER FETCH
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        card.getMembers().remove(member);
        return cardRepository.save(card);
    }

    @Transactional
    public Card assignLabel(Long cardId, Long labelId, Long userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new EntityNotFoundException("Card not found"));

        //ADMIN CHECK
        Long boardId = card.getList().getBoard().getId();
        boardService.requireAdmin(boardId, userId);

        //LABEL FETCH
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new EntityNotFoundException("Label not found"));

        card.getLabels().add(label);
        return cardRepository.save(card);
    }

    @Transactional
    public Card unassignLabel(Long cardId, Long labelId, Long userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new EntityNotFoundException("Card not found"));

        //ADMIN CHECK
        Long boardId = card.getList().getBoard().getId();
        boardService.requireAdmin(boardId, userId);

        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new EntityNotFoundException("Label not found"));

        card.getLabels().remove(label);
        return cardRepository.save(card);
    }
}