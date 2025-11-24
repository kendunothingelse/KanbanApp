package org.example.be.controller;

import lombok.RequiredArgsConstructor;
import org.example.be.entity.KBList;
import org.example.be.service.KBListService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class KBListController {

    private final KBListService kbListService;

    @GetMapping
    public List<KBList> getAllLists() {
        return kbListService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<KBList> getListById(@PathVariable Long id) {
        return kbListService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<KBList> createList(@RequestBody KBList kbList) {
        KBList savedList = kbListService.save(kbList);
        return new ResponseEntity<>(savedList, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<KBList> updateList(@PathVariable Long id, @RequestBody KBList listDetails) {
        return kbListService.findById(id)
                .map(list -> {
                    list.setTitle(listDetails.getTitle());
                    return ResponseEntity.ok(kbListService.save(list));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        kbListService.delete(id);
        return ResponseEntity.noContent().build();
    }
}