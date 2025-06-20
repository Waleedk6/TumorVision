package com.fitnesstan.fitnesstan_backend.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO class to map a single exercise returned by the ExerciseDB API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseDBDto {
    private String id;
    private String name;
    private String gifUrl;
    private String bodyPart;
    private String target;
    private String equipment;
}
