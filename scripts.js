// 사용자 데이터 저장소
let users = [];
let books = [];
let currentUser = null;

// DOM 요소
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const bookSection = document.getElementById('bookSection');
const addBookBtn = document.getElementById('addBookBtn');
const addBookForm = document.getElementById('addBookForm');
const bookList = document.getElementById('bookList');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const authButtons = document.getElementById('authButtons');
const logoutBtn = document.getElementById('logoutBtn');
const showBorrowedBtn = document.getElementById('showBorrowedBtn');
const showAllBtn = document.getElementById('showAllBtn');

// 이벤트 리스너
loginBtn.addEventListener('click', () => showForm(loginForm));
registerBtn.addEventListener('click', () => showForm(registerForm));
addBookBtn.addEventListener('click', () => showForm(addBookForm));
logoutBtn.addEventListener('click', handleLogout);
showBorrowedBtn.addEventListener('click', showBorrowedBooks);
showAllBtn.addEventListener('click', updateBookList);

// 폼 제출 이벤트
loginForm.querySelector('form').addEventListener('submit', handleLogin);
registerForm.querySelector('form').addEventListener('submit', handleRegister);
addBookForm.querySelector('form').addEventListener('submit', handleAddBook);

// 폼 표시 함수
function showForm(form) {
    // 모든 폼 숨기기
    [loginForm, registerForm, addBookForm].forEach(f => f.classList.add('hidden'));
    // 선택된 폼만 표시
    form.classList.remove('hidden');
}

// 회원가입 처리
function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    users.push(user);
    alert('회원가입이 완료되었습니다!');
    showForm(loginForm);
}

// 로그인 처리
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = users.find(u => 
        u.email === formData.get('email') && 
        u.password === formData.get('password')
    );

    if (user) {
        currentUser = user;
        loginForm.classList.add('hidden');
        bookSection.classList.remove('hidden');
        
        // 사용자 정보 표시
        userName.textContent = user.name;
        userInfo.classList.remove('hidden');
        authButtons.classList.add('hidden');
        
        updateBookList();
    } else {
        alert('이메일 또는 비밀번호가 잘못되었습니다.');
    }
}

// 도서 추가 처리
function handleAddBook(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const book = {
        id: Date.now(),
        title: formData.get('title'),
        author: formData.get('author'),
        category: formData.get('category'),
        description: formData.get('description'),
        owner: currentUser.name,
        ownerEmail: currentUser.email,
        borrower: null,
        returnDate: null,
        likes: 0,
        likedBy: []
    };

    books.push(book);
    addBookForm.classList.add('hidden');
    updateBookList();
    e.target.reset();
}

// 도서 목록 업데이트
function updateBookList() {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';
    
    books.forEach(book => {
        const row = document.createElement('tr');
        const returnDate = book.returnDate ? new Date(book.returnDate).toLocaleDateString() : '-';
        const likeButton = `
            <button class="like-btn" onclick="toggleLike(${book.id})">
                ${book.likedBy.includes(currentUser.email) ? '❤️' : '🤍'} 
                ${book.likes}
            </button>
        `;
        
        const borrowButton = book.borrower ? 
            (book.borrower === currentUser.email ?
                `<button class="borrow-btn" onclick="returnBook(${book.id})">반납하기</button>` :
                `<button class="borrow-btn" disabled>대출중</button>`) :
            `<button class="borrow-btn" onclick="borrowBook(${book.id})">대출하기</button>`;

        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>${book.owner}</td>
            <td class="text-center">${likeButton}</td>
            <td>${book.borrower ? '대출중' : '대출가능'}</td>
            <td>${returnDate}</td>
            <td>${borrowButton}</td>
        `;
        bookList.appendChild(row);
    });
}

// 도서 대출 처리
function borrowBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book && !book.borrower) {
        book.borrower = currentUser.email;
        // 2주 후 반납 예정일 설정
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 14);
        book.returnDate = returnDate;
        updateBookList();
        alert(`'${book.title}' 도서가 대출되었습니다!\n반납예정일: ${returnDate.toLocaleDateString()}`);
    }
}

// 도서 반납 함수 추가
function returnBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book && book.borrower === currentUser.email) {
        book.borrower = null;
        book.returnDate = null;
        updateBookList();
        alert(`'${book.title}' 도서가 반납되었습니다!`);
    }
}

// 좋아요 토글 함수 추가
function toggleLike(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book) {
        const userIndex = book.likedBy.indexOf(currentUser.email);
        if (userIndex === -1) {
            book.likedBy.push(currentUser.email);
            book.likes++;
        } else {
            book.likedBy.splice(userIndex, 1);
            book.likes--;
        }
        updateBookList();
    }
}

// 대출 도서만 보기 함수 수정
function showBorrowedBooks() {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';
    
    const borrowedBooks = books.filter(book => book.borrower === currentUser.email);
    
    if (borrowedBooks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" style="text-align: center;">대출한 도서가 없습니다.</td>
        `;
        bookList.appendChild(row);
        return;
    }

    borrowedBooks.forEach(book => {
        const row = document.createElement('tr');
        const returnDate = book.returnDate ? new Date(book.returnDate).toLocaleDateString() : '-';
        const likeButton = `
            <button class="like-btn" onclick="toggleLike(${book.id})">
                ${book.likedBy.includes(currentUser.email) ? '❤️' : '🤍'} 
                ${book.likes}
            </button>
        `;

        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>${book.owner}</td>
            <td class="text-center">${likeButton}</td>
            <td>대출중</td>
            <td>${returnDate}</td>
            <td><button class="borrow-btn" onclick="returnBook(${book.id})">반납하기</button></td>
        `;
        bookList.appendChild(row);
    });
}

// 로그아웃 처리 함수 추가
function handleLogout() {
    currentUser = null;
    bookSection.classList.add('hidden');
    userInfo.classList.add('hidden');
    authButtons.classList.remove('hidden');
    showForm(loginForm);
}

// 초기 화면 설정 추가
document.addEventListener('DOMContentLoaded', () => {
    showForm(loginForm);
});
