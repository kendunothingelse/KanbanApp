package org.example.be.service;

import lombok.RequiredArgsConstructor;
import org.example.be.entity.Label;
import org.example.be.repository.LabelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LabelService {

    private final LabelRepository labelRepository;

    public List<Label> findAll() {
        return labelRepository.findAll();
    }

    public Optional<Label> findById(Long id) {
        return labelRepository.findById(id);
    }

    @Transactional
    public Label save(Label label) {
        return labelRepository.save(label);
    }

    @Transactional
    public void delete(Long id) {
        labelRepository.deleteById(id);
    }

}
