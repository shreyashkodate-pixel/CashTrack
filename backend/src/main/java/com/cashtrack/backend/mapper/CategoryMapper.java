package com.cashtrack.backend.mapper;

import com.cashtrack.backend.dto.request.CreateCategoryRequest;
import com.cashtrack.backend.dto.response.CategoryResponse;
import com.cashtrack.backend.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    Category toEntity(CreateCategoryRequest request);

    CategoryResponse toResponse(Category category);

    void updateEntityFromRequest(CreateCategoryRequest request, @MappingTarget Category category);
}
