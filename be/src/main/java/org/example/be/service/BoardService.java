package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.entity.Board;
import org.example.be.repository.BoardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;

    public List<Board> findAllBoards() {
        return boardRepository.findAll();
    }

    // Use JOIN FETCH to load lists, and rely on transactional context for cards.
    @Transactional
    public Optional<Board> findFullBoardById(Long id) {
        Optional<Board> boardOpt = boardRepository.findBoardWithListsById(id);
        boardOpt.ifPresent(board -> {
            // Initialize cards within the transaction to avoid lazy loading issues
            board.getLists().forEach(list -> list.getCards().size());
        });
        return boardOpt;
    }

    public Optional<Board> findBoardById(Long id) {
        return boardRepository.findById(id);
    }

    @Transactional
    public Board saveBoard(Board board) {
        // Logic to assign creator as admin would go here
        return boardRepository.save(board);
    }

    @Transactional
    public void deleteBoard(Long id) {
        boardRepository.deleteById(id);
    }
}