package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.entity.KBList;
import org.example.be.repository.KBListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KBListService {
    private final KBListRepository repository;

    public List<KBList> findAll() {
        return repository.findAll();
    }

    public Optional<KBList> findById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public KBList save(KBList kbList) {
        return repository.save(kbList);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
