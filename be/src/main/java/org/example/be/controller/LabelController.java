package org.example.be.controller;

import lombok.RequiredArgsConstructor;
import org.example.be.entity.Label;
import org.example.be.service.LabelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/labels")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LabelController {

    private final LabelService labelService;

    @GetMapping
    public List<Label> getAllLabels() {
        return labelService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Label> getLabelById(@PathVariable Long id) {
        return labelService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Label> createLabel(@RequestBody Label label) {
        Label savedLabel = labelService.save(label);
        return new ResponseEntity<>(savedLabel, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Label> updateLabel(@PathVariable Long id, @RequestBody Label labelDetails) {
        return labelService.findById(id)
                .map(label -> {
                    label.setName(labelDetails.getName());
                    label.setColor(labelDetails.getColor());
                    return ResponseEntity.ok(labelService.save(label));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabel(@PathVariable Long id) {
        labelService.delete(id);
        return ResponseEntity.noContent().build();
    }
}