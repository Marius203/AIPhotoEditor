package com.polyedits.aiphotoeditor.repository;

import com.polyedits.aiphotoeditor.model.ImageEdit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageEditRepository extends JpaRepository<ImageEdit, Long> {
}
