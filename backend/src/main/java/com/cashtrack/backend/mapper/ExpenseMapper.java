package com.cashtrack.backend.mapper;

import com.cashtrack.backend.dto.request.CreateExpenseRequest;
import com.cashtrack.backend.dto.response.ExpenseResponse;
import com.cashtrack.backend.entity.Expense;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ExpenseMapper {

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Expense toEntity(CreateExpenseRequest request);

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    ExpenseResponse toResponse(Expense expense);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(CreateExpenseRequest request, @MappingTarget Expense expense);
}
