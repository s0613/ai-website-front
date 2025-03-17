'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../../components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '../../components/ui/pagination';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';

interface Member {
    email: string;
    // 다른 필요한 속성들을 여기에 추가할 수 있습니다.
}

const MemberCheck = () => {
    const [email, setEmail] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [membersPerPage] = useState(20);

    useEffect(() => {
        // 실제 서버 API로 회원 목록 요청 (예: /api/members)
        const fetchMembers = async () => {
            try {
                const res = await fetch('/api/members', {
                    method: 'GET',
                });
                if (res.ok) {
                    const data: Member[] = await res.json();
                    setMembers(data);
                    setFilteredMembers(data);
                } else {
                    console.error('회원 목록 조회 실패');
                }
            } catch (error) {
                console.error('에러 발생:', error);
            }
        };

        fetchMembers();
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value.toLowerCase();
        setEmail(searchValue);
        const filtered = members.filter(member =>
            member.email.toLowerCase().includes(searchValue)
        );
        setFilteredMembers(filtered);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
    };

    // 현재 페이지에 표시할 회원 목록 계산
    const indexOfLastMember = currentPage * membersPerPage;
    const indexOfFirstMember = indexOfLastMember - membersPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);

    // 페이지 변경 핸들러
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="p-4">
            <div className="mb-4">
                <label className="block mb-1 font-semibold">이메일 검색</label>
                <Input
                    type="email"
                    value={email}
                    onChange={handleSearch}
                    placeholder="이메일로 검색"
                    className="w-full"
                />
            </div>
            <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-4">회원 목록</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>이메일</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentMembers.map((member, index) => (
                            <TableRow key={index}>
                                <TableCell>{member.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Pagination className="mt-4">
                    <PaginationPrevious
                        onClick={currentPage === 1 ? undefined : () => paginate(currentPage - 1)}
                    />
                    <PaginationContent>
                        {Array.from({ length: Math.ceil(filteredMembers.length / membersPerPage) }, (_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    isActive={i + 1 === currentPage}
                                    onClick={() => paginate(i + 1)}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                    <PaginationNext
                        onClick={currentPage === Math.ceil(filteredMembers.length / membersPerPage) ? undefined : () => paginate(currentPage + 1)}
                    />
                </Pagination>
            </div>
        </div>
    );
};

export default MemberCheck;